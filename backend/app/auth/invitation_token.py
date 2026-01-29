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
