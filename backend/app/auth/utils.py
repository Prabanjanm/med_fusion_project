from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash password securely."""
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify password."""
    return pwd_context.verify(password, hashed)


def create_access_token(data: dict) -> str:
    """Generate JWT token."""
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    data.update({"exp": expire})
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings


def create_reset_password_token(email: str):
    payload = {
        "sub": email,
        "type": "RESET_PASSWORD",
        "exp": datetime.utcnow() + timedelta(minutes=30),
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
