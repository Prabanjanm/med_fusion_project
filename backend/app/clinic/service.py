import token
from jose import jwt, JWTError
from sqlalchemy import select
from app.models.clinic_invitation import ClinicInvitation
from app.models.user import User
from app.models.clinic import Clinic
from app.auth.utils import hash_password
from app.core.config import settings

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

    db.add(user)
    await db.commit()

    return {
        "message": "Clinic account activated successfully",
        "clinic_id": clinic.id
    }
