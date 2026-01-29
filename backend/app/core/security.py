from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.config import settings

# This tells FastAPI where the token comes from
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def require_role(required_role: str):
    """
    Dependency to enforce role-based access using JWT.
    """

    async def wrapper(token: str = Depends(oauth2_scheme)):
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )

            role = payload.get("role")
            if role != required_role:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )

            return payload

        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )

    return wrapper
