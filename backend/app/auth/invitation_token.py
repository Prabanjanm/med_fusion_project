from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

def create_clinic_invite_token(ngo_id: int, clinic_email: str):
    payload = {
        "ngo_id": ngo_id,
        "clinic_email": clinic_email,
        "type": "clinic_invite",
        "exp": datetime.utcnow() + timedelta(minutes=30)
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# app/auth/invitation_token.py

from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings


def create_invite_token(
    *,
    role: str,
    email: str,
    csr_uid: str | None = None,
    ngo_uid: str | None = None,
):
    payload = {
        "sub": email,
        "role": role,
        "type": "INVITE",
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }

    # Attach correct UID based on role
    if role == "CSR" and csr_uid:
        payload["csr_uid"] = csr_uid

    if role == "NGO" and ngo_uid:
        payload["ngo_uid"] = ngo_uid

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

