from fastapi import HTTPException, status
from app.auth.service import authenticate

def login_user(username: str, password: str):
    token = authenticate(username, password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    return {
        "access_token": token,
        "token_type": "bearer"
    }
