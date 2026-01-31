import token
from fastapi.concurrency import run_in_threadpool
from jose import jwt, JWTError
from sqlalchemy import select
from app.models.clinic_invitation import ClinicInvitation
from app.models.user import User
from app.models.clinic import Clinic
from app.auth.utils import hash_password
from app.core.config import settings
from app.blockchain.service import log_to_blockchain
from app.models.donation import Donation

async def accept_clinic_invitation(
    db,
    token: str,
    password: str
):
    """
    Clinic sets password using platform-signed invitation.
    """

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "clinic_invite":
            raise ValueError("Invalid invitation token")
    except JWTError:
        raise ValueError("Invitation expired or invalid")

    result = await db.execute(
        select(ClinicInvitation)
        .where(ClinicInvitation.token == token)
    )
    invitation = result.first()

    if not invitation or invitation.accepted:
        raise ValueError("Invitation already used or invalid")

    # Create clinic user
    user = User(
        email=payload["clinic_email"],
        password_hash=hash_password(password),
        role="CLINIC",
        password_set=True
    )

    invitation.accepted = True
    db.add(user)
    await db.commit()

    return {"message": "Clinic onboarded successfully"}



from jose import jwt, JWTError
from fastapi import HTTPException
from app.core.config import settings


def verify_clinic_invite_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        print("Payload in verify function:", payload)
        if payload.get("type") != "clinic_invite":
            raise HTTPException(status_code=400, detail="Invalid token type")

        return payload  # ✅ dict

    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")



async def set_clinic_password(db, token: str, password: str):
    """
    Activate clinic account by setting password and linking clinic_id.
    """
    
    token_payload = verify_clinic_invite_token(token)

    clinic_email = token_payload["clinic_email"]
    print("CLINIC EMAIL:", clinic_email)
    result = await db.execute(
    select(Clinic.id).where(Clinic.official_email == clinic_email)
)

    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Clinic not found")

    clinic_id = row[0]
    print("CLINIC ID:", clinic_id)
    # 1️⃣ Fetch clinic from DB
    result = await db.execute(
        select(Clinic).where(Clinic.official_email == clinic_email)
    )
    clinic = result.first()
    print("CLINIC FETCHED:", clinic)

    if not clinic:
        raise ValueError("Clinic not found")

    # 2️⃣ Check if user already exists
    result = await db.execute(
        select(User).where(User.email == clinic_email)
    )
    existing_user = result.first()

    if existing_user:
        raise ValueError("Clinic user already exists")

    # 3️⃣ Create clinic user WITH clinic_id
    print("clinic.id:", clinic_id)
    user = User(
        email=clinic_email,
        password_hash=hash_password(password),
        password_set=True,
        role="CLINIC",
        clinic_id=clinic_id   # 🔥 THIS WAS MISSING
    )

    # 4️⃣ Activate the clinic
    clinic[0].is_active = True
    db.add(clinic[0])
    db.add(user)
    await db.commit()

    return {
        "message": "Clinic account activated successfully",
        "clinic_id": clinic_id
    }

from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.donation_allocation import DonationAllocation
from app.models.clinic_requirment import ClinicRequirement


async def confirm_receipt(
    db: AsyncSession,
    clinic_user: dict,
    allocation_id: int
):
    """
    Clinic confirms receipt of allocated donation
    """

    clinic_id = clinic_user["clinic_id"]

    # 1️⃣ Fetch allocation + clinic relation
    result = await db.execute(
        select(DonationAllocation, ClinicRequirement)
        .join(
            ClinicRequirement,
            DonationAllocation.clinic_requirement_id == ClinicRequirement.id
        )
        .where(DonationAllocation.id == allocation_id)
    )

    row = result.first()
    if not row:
        raise HTTPException(404, "Allocation not found")

    allocation, requirement = row

    donation = await db.get(Donation, allocation.donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    
    # 2️⃣ Ownership check
    if requirement.clinic_id != clinic_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This allocation does not belong to your clinic"
        )

    # 3️⃣ Prevent double confirmation
    if allocation.received:
        raise HTTPException(
            status_code=400,
            detail="Donation already confirmed as received"
        )

    # 4️⃣ Mark as received
    allocation.received = True
    allocation.received_at = datetime.utcnow()

    await db.commit()
    audit = await run_in_threadpool(
        log_to_blockchain,
        "DONATION_RECEIVED",
        str(donation.id)
    )
    print(audit)
    return {"audit": audit ,"message": "Donation receipt confirmed successfully"
            }


from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.donation_allocation import DonationAllocation
from app.models.clinic_requirment import ClinicRequirement
from app.models.donation import Donation
from app.models.ngo import NGO


async def get_clinic_allocation_history(
    db: AsyncSession,
    clinic_user: dict
):
    """
    Fetch all donation allocations for logged-in clinic
    """

    clinic_id = clinic_user["clinic_id"]

    result = await db.execute(
        select(
            DonationAllocation.id,
            Donation.item_name,
            Donation.quantity,
            Donation.purpose,
            NGO.ngo_name,
            DonationAllocation.allocated_at,
            DonationAllocation.received,
            DonationAllocation.received_at,
        )
        .join(
            ClinicRequirement,
            DonationAllocation.clinic_requirement_id == ClinicRequirement.id
        )
        .join(
            Donation,
            DonationAllocation.donation_id == Donation.id
        )
        .join(
            NGO,
            ClinicRequirement.ngo_id == NGO.id
        )
        .where(ClinicRequirement.clinic_id == clinic_id)
        .order_by(DonationAllocation.allocated_at.desc())
    )

    rows = result.all()

    return [
        {
            "allocation_id": r.id,
            "item_name": r.item_name,
            "quantity": r.quantity,
            "purpose": r.purpose,
            "ngo_name": r.ngo_name,
            "allocated_at": r.allocated_at,
            "received": r.received,
            "received_at": r.received_at,
        }
        for r in rows
    ]
