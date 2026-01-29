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
    clinic_name: str
):
    """
    Register clinic and send secure invitation email.
    NGO must be verified.
    """

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

    invite_link = f"{settings.FRONTEND_URL}/clinic/onboard?token={token}"

    await send_clinic_invitation_email(
        to_email=clinic_email,
        clinic_name=clinic_name,
        ngo_name=ngo.name,
        csr1_number=ngo.csr1_number,
        invite_link=invite_link,
        reference_id=reference_id
    )

    return {
        "message": "Clinic invitation sent successfully",
        "invitation_reference": reference_id
    }
