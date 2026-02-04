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
        if payload.get("type") != "clinic_set_password":
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



from jose import jwt, ExpiredSignatureError, JWTError
from fastapi import HTTPException
from app.core.config import settings

def verify_clinic_invite_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"at_hash": False} # Basic options
        )
        
        # Security: Specifically check for the clinic set password type
        if payload.get("type") != "clinic_set_password":
            raise HTTPException(status_code=400, detail="Invalid activation link type")

        return payload

    except ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Activation link has expired. Please request a new invitation.")
    except JWTError as e:
        raise HTTPException(status_code=400, detail=f"Invalid activation link: {str(e)}")



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
        raise HTTPException(status_code=400, detail="Clinic account is already active. Please log in.")

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
    allocation_id: int,
    data = None
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
    print(f"DEBUG: Confirming receipt for allocation {allocation_id}")
    allocation.received = True
    allocation.received_at = datetime.utcnow()
    
    if data:
        print(f"DEBUG: Received feedback: {data.feedback}, Rating: {data.quality_rating}")
        allocation.feedback = data.feedback
        allocation.quality_rating = data.quality_rating

    donation.status = "RECEIVED"  # ✅ Update Donation status for tracking

    try:
        await db.commit()
    except Exception as e:
        print(f"DATABASE ERROR in confirm_receipt: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Database error during confirmation: {str(e)}. This might be due to missing database columns 'feedback' or 'quality_rating'."
        )

    print("DEBUG: Commit successful")
    # 5️⃣ Log to Blockchain (Audit Trail)
    # Include item name and quality metrics in the data
    blockchain_data = {
        "donation_id": donation.id,
        "item_name": donation.item_name,
        "quality_rating": allocation.quality_rating,
        "feedback": allocation.feedback,
        "received_at": allocation.received_at.isoformat() if allocation.received_at else None
    }
    
    try:
        audit = await run_in_threadpool(
            log_to_blockchain,
            "DONATION_RECEIVED",
            str(blockchain_data)
        )
    except Exception as e:
        print(f"Blockchain Error: {e}")
        audit = {"tx_hash": "PENDING", "status": "OFF_CHAIN_ONLY"}
    
    print(audit)
    return {"audit": audit ,"message": "Donation receipt confirmed successfully"}


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
            DonationAllocation.donation_id,
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
            "donation_id": r.donation_id,
            "item_name": r.item_name,
            "quantity": r.quantity,
            "purpose": r.purpose,
            "ngo_name": r.ngo_name,
            "allocated_at": r.allocated_at,
            "received": r.received,
            "received_at": r.received_at,
            "status": "RECEIVED" if r.received else "ALLOCATED"
        }
        for r in rows
    ]

async def get_clinic_requests(
    db: AsyncSession,
    clinic_user: dict
):
    """
    Fetch all requirements submitted for this clinic
    """
    clinic_id = clinic_user["clinic_id"]
    result = await db.execute(
        select(ClinicRequirement)
        .where(ClinicRequirement.clinic_id == clinic_id)
        .order_by(ClinicRequirement.created_at.desc())
    )
    return result.scalars().all()

async def create_clinic_requirement(
    db: AsyncSession,
    clinic_user: dict,
    data
):
    """
    Create a new requirement (need) from the clinic side.
    Sets status as 'CLINIC_REQUESTED' for NGO to approve.
    """
    clinic_id = clinic_user["clinic_id"]
    
    # Get the NGO associated with this clinic to set the ngo_id
    clinic = await db.get(Clinic, clinic_id)
    if not clinic:
        raise HTTPException(404, "Clinic record not found")
        
    requirement = ClinicRequirement(
        clinic_id=clinic_id,
        ngo_id=clinic.ngo_id,
        item_name=data.item_name,
        quantity=data.quantity,
        priority=data.priority, 
        purpose=data.purpose,
        status="CLINIC_REQUESTED"
    )
    db.add(requirement)
    await db.commit()
    await db.refresh(requirement)
    return requirement
