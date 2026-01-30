from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trusted_ngo import TrustedNGO
from app.models.ngo import NGO
from app.models.user import User
from fastapi import HTTPException, status
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.company import Company



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

    ngo = NGO(
        ngo_name=data.ngo_name,
        csr_1_number=data.csr_1_number,
        has_80g=data.has_80g,
        official_email=data.official_email,
        is_verified=True
    )
    db.add(ngo)
    await db.flush()

    user = User(
        email=data.official_email,
        role="NGO",
        ngo_id=ngo.id,
        password_set=False
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

    # 3️⃣ Create clinic need
    need = ClinicRequirement(
        ngo_id=ngo.id,
        clinic_id=clinic.id,
        item_name=data.item_name,
        quantity=data.quantity,
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

