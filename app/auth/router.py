# from fastapi import APIRouter, Depends
# from fastapi.security import OAuth2PasswordRequestForm
# from app.auth.controller import login_user

# router = APIRouter(prefix="/auth", tags=["Auth"])

# @router.post("/login")
# def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     return login_user(form_data.username, form_data.password)



# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.ext.asyncio import AsyncSession
# from app.db.deps import get_db
# from app.auth.magic_service import send_magic_login

# from app.auth.login_service import login_user

# router = APIRouter(prefix="/auth", tags=["Auth"])


# @router.post("/login")
# async def login(email: str, password: str):
#     try:
#         return await login_user(email, password)
#     except ValueError as e:
#         raise HTTPException(status_code=401, detail=str(e))

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.auth.service import login_user, set_password # Import both services
from app.clinic.schema import SetPasswordRequest
from app.clinic.service import accept_clinic_invitation, set_clinic_password

# 1. Define the router ONCE
router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# 2. Add the Login endpoint
@router.post("/login", summary="Login using email and password")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    try:
        return await login_user(
            db,
            email=form_data.username,
            password=form_data.password
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

# 3. Add the Set Password endpoint to the SAME router
@router.post("/set-password")
async def set_password_endpoint(
    email: str, 
    password: str, 
    db: AsyncSession = Depends(get_db)
):
    try:
        return await set_password(db, email, password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/clinic/set-password")
async def set_clinic_password_endpoint(
    data: SetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    return await set_clinic_password(db, data.token, data.password)
