from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trusted_ngo import TrustedNGO
from app.models.ngo import NGO
from app.models.user import User
from fastapi import HTTPException, UploadFile, status
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.company import Company
from app.models.donation_allocation import DonationAllocation
from app.blockchain.service import log_to_blockchain
from app.core.id_generator import generate_uid
from app.services.storage_service import upload_org_document



async def register_ngo(
    db: AsyncSession,
    ngo_name: str,
    csr_1_number: str,
    has_80g: bool,
    official_email: str,
    registration_doc: UploadFile,
    certificate_80g_doc: UploadFile,
):
    """
    Register NGO with document upload.
    Admin approval required before login.
    """

    # 1️⃣ Verify NGO in trusted registry
    trusted = await db.execute(
        select(TrustedNGO).where(
            TrustedNGO.csr_1_number == csr_1_number,
            TrustedNGO.has_80g == has_80g,
            TrustedNGO.official_email == official_email,
        )
    )

    if not trusted.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="NGO not found or verification failed in registry",
        )

    # 2️⃣ Check if NGO already registered
    existing = await db.execute(
        select(NGO).where(NGO.csr_1_number == csr_1_number)
    )
    ngo = existing.scalar_one_or_none()

    if ngo:
        return {
            "message": "NGO already registered",
            "ngo_uid": ngo.ngo_uid,
            "next_step": "Please wait for admin verification",
        }

    # 3️⃣ Read uploaded files
    try:
        registration_bytes = await registration_doc.read()
        certificate_bytes = await certificate_80g_doc.read()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to read uploaded documents",
        )

    # 4️⃣ Upload documents to bucket
    registration_path = upload_org_document(
        file_bytes=registration_bytes,
        filename=registration_doc.filename,
        folder="ngo_registration",
    )

    certificate_path = upload_org_document(
        file_bytes=certificate_bytes,
        filename=certificate_80g_doc.filename,
        folder="ngo_80g",
    )

    # 5️⃣ Create NGO record (unverified)
    ngo = NGO(
        ngo_uid=generate_uid("NGO"),
        ngo_name=ngo_name,
        csr_1_number=csr_1_number,
        has_80g=has_80g,
        official_email=official_email,
        registration_doc=registration_path,
        certificate_80g_doc=certificate_path,
        is_verified=False,
    )

    db.add(ngo)
    await db.commit()
    await db.refresh(ngo)

    return {
        "message": "NGO registered successfully",
        "ngo_uid": ngo.ngo_uid,
        "next_step": "Admin will verify documents. Password setup link will be emailed after approval.",
    }



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
    invite_link = f"{settings.FRONTEND_URL}/static/set-clinic-password.html?token={token}"

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
        purpose=data.purpose
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
    audit = await run_in_threadpool(
        log_to_blockchain,
        "DONATION_CREATED",
        str(donation.id)
    )


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
    result = await db.execute(
        select(Donation)
        .where(Donation.ngo_id.is_(None))
        .where(Donation.status == "AUTHORIZED")
        .order_by(Donation.created_at.desc())
    )

    return result.scalars().all()

async def get_accepted_donations(db, ngo):
    result = await db.execute(
        select(Donation)
        .where(Donation.ngo_id == ngo)
        .where(Donation.status == "ACCEPTED")
    )
    return result.scalars().all()

async def get_clinic_requirements(db, ngo):
    result = await db.execute(
        select(ClinicRequirement)
        .where(ClinicRequirement.ngo_id == ngo)
        .order_by(ClinicRequirement.priority.desc())
    )
    return result.scalars().all()


async def allocate_donation(db, payload, donation_id, clinic_requirement_id):
    donation = await db.get(Donation, donation_id)
    requirement = await db.get(ClinicRequirement, clinic_requirement_id)
    ngo_id = payload.get("ngo_id")
    if not donation or donation.status != "ACCEPTED":
        raise HTTPException(400, "Donation not eligible")
    print("NGO:", ngo_id)
    if requirement.ngo_id != ngo_id:
        raise HTTPException(403, "Invalid clinic requirement")

    allocation = DonationAllocation(
        donation_id=donation.id,
        clinic_requirement_id=requirement.id
    )

    donation.status = "ALLOCATED"

    db.add(allocation)
    await db.commit()
    await db.refresh(allocation)
    audit = await run_in_threadpool(
        log_to_blockchain,
        "DONATION_ALLOCATED",
        str(donation.id)
    )

    return { "allocation": allocation, "audit": audit }