from jose import jwt, JWTError
from sqlalchemy import select
from app.models.clinic_invitation import ClinicInvitation
from app.models.user import User
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
    invitation = result.scalar_one_or_none()

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
