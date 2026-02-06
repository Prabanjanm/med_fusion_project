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
from app.core.security import get_current_user
from app.models.user import User
from app.models.company import Company
from app.models.ngo import NGO
from app.models.clinic import Clinic
from sqlalchemy import select

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
    try:
        return await set_clinic_password(db, data.token, data.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Re-raise HTTPExceptions, but catch others
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me")
async def get_me(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch organization details based on role
    org_name = "N/A"
    org_details = {}

    if user.role == "CSR" and user.company_id:
        res = await db.execute(select(Company).where(Company.id == user.company_id))
        org = res.scalar_one_or_none()
        if org:
            org_name = org.company_name
            org_details = {"cin": org.cin, "pan": org.pan}
    elif user.role == "NGO" and user.ngo_id:
        res = await db.execute(select(NGO).where(NGO.id == user.ngo_id))
        org = res.scalar_one_or_none()
        if org:
            org_name = org.ngo_name
            org_details = {"csr_1": org.csr_1_number}
    elif user.role == "CLINIC" and user.clinic_id:
        res = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
        org = res.scalar_one_or_none()
        if org:
            org_name = org.clinic_name
            org_details = {"address": org.address}

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "organization_name": org_name,
        "organization_details": org_details,
        "identity_token": f"ID-{user.id:04d}-{user.role[:2]}-{user.id % 100}"
    }
