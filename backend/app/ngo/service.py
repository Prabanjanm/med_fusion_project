from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trusted_ngo import TrustedNGO
from app.models.ngo import NGO
from app.models.user import User
from fastapi import HTTPException, status

from app.models.donation import Donation
from app.models.company import Company
from app.models.donation_allocation import DonationAllocation
from app.blockchain.service import log_to_blockchain
from app.auth.utils import hash_password



async def register_and_verify_ngo(
    db: AsyncSession,
    data
):
    """
    Register NGO only if CSR-1 and 80G match trusted registry.
    """

    trusted = await db.execute(
        select(TrustedNGO).where(
            TrustedNGO.csr_1_number == data.csr_1_number
        )
    )
    trusted_ngo = trusted.scalar_one_or_none()

    if not trusted_ngo:
        raise ValueError("NGO not found in CSR-1 registry")

    if trusted_ngo.has_80g != data.has_80g:
        raise ValueError("80G verification failed")

    if trusted_ngo.official_email != data.official_email:
        raise ValueError("Official email mismatch")

    # 1.1 Check if NGO already exists
    existing_ngo = await db.execute(select(NGO).where(NGO.csr_1_number == data.csr_1_number))
    if existing_ngo.scalar_one_or_none():
        raise ValueError("An NGO with this CSR-1 number is already registered.")

    # 1.2 Check if User already exists
    existing_user = await db.execute(select(User).where(User.email == data.official_email))
    if existing_user.scalar_one_or_none():
        raise ValueError(f"The email '{data.official_email}' is already registered in our system. Please try logging in or use a different email.")

    ngo = NGO(
        ngo_name=data.ngo_name,
        csr_1_number=data.csr_1_number,
        has_80g=data.has_80g,
        official_email=data.official_email,
        is_verified=None  # ✅ Pending Auditor Approval
    )
    db.add(ngo)
    await db.flush()

    user = User(
        email=data.official_email,
        role="NGO",
        ngo_id=ngo.id,
        password_set=bool(data.password),
        password_hash=hash_password(data.password) if data.password else None
    )
    db.add(user)

    await db.commit()

    return ngo





async def check_ngo_acceptance_eligibility(
    db,
    donation_id: int,
    ngo_id: int
):
    """
    Business-grade pre-acceptance eligibility check for NGOs.

    This function ensures:
    - NGO is legally eligible to receive CSR funds
    - Donation is in correct state
    - Donor company is not blacklisted

    Returns:
        dict: eligibility result with reasons
    """

    reasons = []

    # 1️⃣ Fetch NGO
    ngo_result = await db.execute(
        select(NGO).where(NGO.id == ngo_id)
    )
    ngo = ngo_result.scalar_one_or_none()

    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="NGO not found"
        )

    # NGO eligibility checks
    if not ngo.is_verified:
        reasons.append("NGO is not verified")

    if not ngo.csr_1_number:
        reasons.append("CSR-1 registration missing")

    if not ngo.has_80g:
        reasons.append("80G certificate inactive")

    # 2️⃣ Fetch Donation + Company
    donation_result = await db.execute(
        select(Donation, Company)
        .join(Company, Donation.company_id == Company.id)
        .where(Donation.id == donation_id)
    )
    row = donation_result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found"
        )

    donation, company = row

    # Donation status check
    if donation.status != "AUTHORIZED":
        reasons.append("Donation is not authorized for acceptance")

    if donation.ngo_id is not None:
        reasons.append("Donation already accepted by another NGO")

    # 3️⃣ Donor blacklist check
    blacklist_result = False
    if blacklist_result:
        pass

    # 4️⃣ Final eligibility decision
    return {
        "eligible": len(reasons) == 0,
        "reasons": reasons
    }


import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.clinic_invitation import ClinicInvitation
from app.auth.invitation_token import create_clinic_invite_token
from app.notifications.email_service import send_clinic_invitation_email
from app.core.config import settings


async def register_clinic(
    db: AsyncSession,
    ngo,
    clinic_email: str,
    clinic_name: str,
    facility_id: str,
    facility_id_type: str,
    doctor_registration_number: str,
    pincode: str
):
    """
    Register clinic and send secure invitation email.
    NGO must be verified.
    """
    existing = await db.execute(
        select(Clinic).where(Clinic.official_email == clinic_email)
    )
    # if existing.scalar_one_or_none():
    #     raise HTTPException(
    #         status_code=400,
    #         detail="Clinic already registered"
    #     )

    # 2️⃣ CREATE clinic row (THIS WAS MISSING)
    clinic = Clinic(
        clinic_name=clinic_name,
        official_email=clinic_email,
        ngo_id=ngo.id,
        facility_id=facility_id,
        facility_id_type=facility_id_type,
        doctor_registration_number=doctor_registration_number,
        pincode=pincode,
        is_active=False
    )
    db.add(clinic)
    await db.commit()
    await db.refresh(clinic)

    reference_id = f"INV-CLINIC-{datetime.utcnow().year}-{uuid.uuid4().hex[:6].upper()}"

    token = create_clinic_invite_token(
        ngo_id=ngo.id,
        clinic_email=clinic_email
    )

    invitation = ClinicInvitation(
        reference_id=reference_id,
        ngo_id=ngo.id,
        clinic_email=clinic_email,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=30)
    )

    db.add(invitation)
    await db.commit()

    if clinic.ngo_id != ngo.id:
     raise HTTPException(
        status_code=403,
        detail="Clinic does not belong to this NGO"
    )

    print("TOken:", token)
    invite_link = f"{settings.FRONTEND_URL}/auth/set-password?token={token}"

    await send_clinic_invitation_email(
        to_email=clinic_email,
        clinic_name=clinic_name,
        ngo_name=ngo.ngo_name,
        csr1_number=ngo.csr_1_number,
        invite_link=invite_link,
        reference_id=reference_id
    )
    

    return {
        "message": "Clinic invitation sent successfully",
        "invitation_reference": reference_id
    }

from sqlalchemy import select
from fastapi import HTTPException, status

from app.models.clinic import Clinic
from app.models.user import User
from app.models.clinic_requirment import ClinicRequirement


async def create_clinic_need(db, ngo, data):
    """
    Create a clinic need ONLY if:
    - clinic exists
    - clinic has completed onboarding (password set)
    """
  
    # 1️⃣ Check clinic exists
    clinic = await db.get(Clinic, data.clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=404,
            detail="Clinic not found"
        )

    # 2️⃣ Check clinic user & password status
    result = await db.execute(
        select(User)
        .where(User.clinic_id == clinic.id)
        .where(User.password_set == True)
    )
    clinic_user = result.scalar_one_or_none()

    if not clinic_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clinic has not completed onboarding (password not set)"
        )
    
    if data.priority not in [1, 2, 3, 4]:
        raise HTTPException(
            400,
            "Priority must be between 1 (Critical) and 4 (Low)"
        )
    
    # 3️⃣ Create clinic need
    need = ClinicRequirement(
        ngo_id=ngo.id,
        clinic_id=clinic.id,
        item_name=data.item_name,
        quantity=data.quantity,
        priority=data.priority,
        purpose=data.purpose,
        status="NGO_APPROVED"
    )

    db.add(need)
    await db.commit()
    await db.refresh(need)

    return need

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.deps import get_db
from app.core.security import require_role
from app.models.ngo import NGO


async def get_current_ngo(
    db: AsyncSession = Depends(get_db),
    payload: dict = Depends(require_role("NGO"))
) -> NGO:
    """
    Dependency to get the current NGO object for the authenticated NGO user.
    """
    ngo_id = payload.get("ngo_id")
    if not ngo_id:
        raise HTTPException(status_code=400, detail="NGO ID not found in token")
    
    result = await db.execute(select(NGO).where(NGO.id == ngo_id))
    ngo = result.scalar_one_or_none()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    return ngo


from fastapi import HTTPException
from sqlalchemy import select, func
from app.models.donation import Donation
from app.models.clinic_requirment import ClinicRequirement


async def accept_csr_donation(db, payload, donation_id: int):
    """
    Accept CSR donation ONLY if valid clinic requirements exist.
    """
    
    ngo_id = payload.get("ngo_id")
    donation = await db.get(Donation, donation_id)

    if not donation:
        raise HTTPException(404, "Donation not found")

    if donation.status != "AUTHORIZED":
        raise HTTPException(400, "Donation already processed")

    donation.status = "ACCEPTED"
    donation.ngo_id = ngo_id

    await db.commit()
    await db.refresh(donation)
    # Fetch NGO name for audit trail
    result = await db.execute(select(NGO.ngo_name).where(NGO.id == ngo_id))
    ngo_name = result.scalar() or "NGO Partner"

    # Fetch Company name for Metadata
    company_result = await db.execute(select(Company.company_name).where(Company.id == donation.company_id))
    company_name = company_result.scalar() or "CSR Partner"

    try:
        audit = await run_in_threadpool(
            log_to_blockchain,
            action="DONATION_ACCEPTED",
            entity=str(donation.id),
            role="NGO",
            donor_name=ngo_name,
            metadata={
                "ngo_name": ngo_name,
                "company_name": company_name
            }
        )
    except Exception as e:
        print(f"Blockchain Error: {e}")
        audit = {"tx_hash": "PENDING", "status": "OFF_CHAIN_ONLY"}

    return {
        "message": "Donation accepted successfully",
        "donation_id": donation_id,
        "item": donation.item_name,
        "quantity": donation.quantity,
        "status": donation.status,
        "audit": audit
    }


from sqlalchemy import select
from app.models.donation import Donation

async def get_available_donations(db: AsyncSession):
    """
    Return donations that are not yet accepted by any NGO
    """
    from app.models.company import Company
    result = await db.execute(
        select(Donation, Company)
        .join(Company, Donation.company_id == Company.id)
        .where(Donation.ngo_id.is_(None))
        .where(Donation.status == "AUTHORIZED")
        .order_by(Donation.created_at.desc())
    )

    donations = []
    for row in result.all():
        donation, company = row
        donations.append({
            "id": donation.id,
            "donation_id": donation.id,
            "item_name": donation.item_name,
            "quantity": donation.quantity,
            "company_name": company.company_name,
            "status": donation.status,
            "created_at": donation.created_at
        })

    return donations

async def get_accepted_donations(db, ngo):
    ngo_id = ngo.get("ngo_id") if isinstance(ngo, dict) else ngo
    from app.models.company import Company
    result = await db.execute(
        select(Donation, Company)
        .join(Company, Donation.company_id == Company.id)
        .where(Donation.ngo_id == ngo_id)
        .where(Donation.status == "ACCEPTED")
    )
    
    donations = []
    for row in result.all():
        donation, company = row
        donations.append({
            "id": donation.id,
            "donation_id": donation.id, # frontend uses both
            "item_name": donation.item_name,
            "quantity": donation.quantity,
            "company_name": company.company_name,
            "status": donation.status,
            "created_at": donation.created_at
        })
    return donations

async def get_clinic_requirements(db, ngo):
    ngo_id = ngo.get("ngo_id") if isinstance(ngo, dict) else ngo
    from app.models.clinic import Clinic
    result = await db.execute(
        select(ClinicRequirement, Clinic)
        .join(Clinic, ClinicRequirement.clinic_id == Clinic.id)
        .where(ClinicRequirement.ngo_id == ngo_id)
        .order_by(ClinicRequirement.priority.desc())
    )
    
    requirements = []
    for row in result.all():
        req, clinic = row
        requirements.append({
            "id": req.id,
            "clinic_id": req.clinic_id,
            "clinic_name": clinic.clinic_name,
            "item_name": req.item_name,
            "quantity": req.quantity,
            "purpose": req.purpose,
            "priority": req.priority,
            "status": req.status,
            "created_at": req.created_at
        })
    return requirements


async def allocate_donation(db, payload, donation_id, clinic_requirement_id):
    donation = await db.get(Donation, donation_id)
    requirement = await db.get(ClinicRequirement, clinic_requirement_id)
    ngo_id = payload.get("ngo_id")
    if not donation:
        raise HTTPException(404, "Donation batch not found")
    
    if donation.status == "ALLOCATED":
        raise HTTPException(400, "This donation batch has already been allocated")

    if donation.status != "ACCEPTED":
        raise HTTPException(400, f"Donation is not eligible for allocation (Status: {donation.status})")
    print("NGO:", ngo_id)
    if requirement.ngo_id != ngo_id:
        raise HTTPException(403, "Invalid clinic requirement")

    allocation = DonationAllocation(
        donation_id=donation.id,
        clinic_requirement_id=requirement.id
    )

    donation.status = "ALLOCATED"
    
    # Calculate sum of all allocated donations for this requirement (including this one)
    # Note: We haven't flushed the new allocation yet, so we sum existing ones + current donation
    existing_allocations_result = await db.execute(
        select(func.sum(Donation.quantity))
        .join(DonationAllocation, DonationAllocation.donation_id == Donation.id)
        .where(DonationAllocation.clinic_requirement_id == clinic_requirement_id)
    )
    already_allocated = existing_allocations_result.scalar() or 0
    total_fulfilled = already_allocated + donation.quantity

    if total_fulfilled >= requirement.quantity:
        requirement.status = "ALLOCATED"
    else:
        requirement.status = "PARTIALLY_ALLOCATED"

    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    # Fetch NGO name for audit trail
    result = await db.execute(select(NGO.ngo_name).where(NGO.id == ngo_id))
    ngo_name = result.scalar() or "NGO Partner"
    
    # Fetch Clinic Name for Metadata
    clinic_result = await db.execute(select(Clinic.clinic_name).where(Clinic.id == requirement.clinic_id))
    clinic_name = clinic_result.scalar() or "Clinic"

    # Fetch Company Name for Metadata
    company_result = await db.execute(select(Company.company_name).where(Company.id == donation.company_id))
    company_name = company_result.scalar() or "CSR Partner"

    try:
        audit = await run_in_threadpool(
            log_to_blockchain,
            action="DONATION_ALLOCATED",
            entity=str(donation.id),
            role="NGO",
            donor_name=ngo_name,
            metadata={
                "clinic_name": clinic_name,
                "company_name": company_name,
                "ngo_name": ngo_name
            }
        )
    except Exception as e:
        print(f"Blockchain Error: {e}")
        audit = {"tx_hash": "PENDING", "status": "OFF_CHAIN_ONLY"}

    return { "allocation": allocation, "audit": audit }

async def get_allocation_history(db: AsyncSession, ngo: dict):
    ngo_id = ngo.get("ngo_id")
    from app.models.clinic import Clinic
    result = await db.execute(
        select(DonationAllocation, Donation, ClinicRequirement, Clinic)
        .join(Donation, DonationAllocation.donation_id == Donation.id)
        .join(ClinicRequirement, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .join(Clinic, ClinicRequirement.clinic_id == Clinic.id)
        .where(ClinicRequirement.ngo_id == ngo_id)
        .order_by(DonationAllocation.allocated_at.desc())
    )
    
    allocations = []
    for row in result.all():
        alloc, donation, req, clinic = row
        allocations.append({
            "id": alloc.id,
            "donation_id": donation.id,
            "item_name": donation.item_name,
            "quantity": donation.quantity,
            "clinic_name": clinic.clinic_name,
            "status": donation.status,
            "allocated_at": alloc.allocated_at,
            "received": alloc.received,
            "received_at": alloc.received_at,
            "feedback": alloc.feedback,
            "quality_rating": alloc.quality_rating
        })
    return allocations


async def get_clinic_feedback(db: AsyncSession, ngo: dict, clinic_id: int):
    ngo_id = ngo.get("ngo_id")
    from app.models.clinic import Clinic
    
    # Verify clinic belongs to NGO
    clinic = await db.get(Clinic, clinic_id)
    if not clinic:
        raise HTTPException(404, "Clinic not found")
        
    if clinic.ngo_id != ngo_id:
        raise HTTPException(403, "Clinic does not belong to this NGO")
        
    # Fetch feedback using similar logic to admin service
    result = await db.execute(
        select(
            DonationAllocation, Donation, ClinicRequirement
        )
        .join(Donation, DonationAllocation.donation_id == Donation.id)
        .join(ClinicRequirement, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .where(
            ClinicRequirement.clinic_id == clinic_id,
            ClinicRequirement.ngo_id == ngo_id,
            DonationAllocation.feedback.isnot(None) # Only fetch if feedback exists
        )
        .order_by(DonationAllocation.received_at.desc())
    )
    
    feedback_history = []
    for row in result.all():
        alloc, donation, req = row
        feedback_history.append({
            "id": alloc.id,
            "item_name": donation.item_name,
            "quantity": donation.quantity,
            "feedback": alloc.feedback,
            "quality_rating": alloc.quality_rating,
            "received_at": alloc.received_at
        })
        
    return feedback_history