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

from select import select
from sqlalchemy import select
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.auth.service import login_user, set_password, set_password_from_token # Import both services
from app.clinic.schema import SetPasswordRequest
from app.clinic.service import accept_clinic_invitation, set_clinic_password
from app.auth.utils import hash_password
from app.auth.utils import hash_password
from app.models.user import User
from app.models.company import Company
from jose import jwt, JWTError
from app.core.config import settings
from app.models.ngo import NGO

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

@router.post("/set-csr-password")
async def set_csr_password(
    data: SetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1️⃣ Decode token
    print("Received token for CSR password setup:", data.token)
    payload = jwt.decode(
        data.token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )
    print("Decoded token payload:", payload)
    email = payload.get("sub")
    role = payload.get("role")
    csr_uid = payload.get("csr_uid")

    if role != "CSR" or not csr_uid:
        raise HTTPException(status_code=400, detail="Invalid invitation token")
    
    print("Token is valid. Proceeding with CSR password setup for email:", csr_uid)
    # 2️⃣ Fetch company using csr_uid
    result = await db.execute(
        select(Company).where(Company.csr_uid == csr_uid)
    )
    print("Company fetch result:", result)
    company = result.scalar_one_or_none()
    print("Company found for CSR password setup:", company)

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        print("Company found for CSR password setup:", company.company_name)    
    # 3️⃣ Check if user already exists
    result = await db.execute(
        select(User).where(User.company_id == company.id)
    )
    print("User fetch result:", result)
    user = result.scalar_one_or_none()

    # 4️⃣ Hash password
    hashed_password = hash_password(data.password)
    print("Password hashed successfully for email:", email)
    # 5️⃣ CREATE or UPDATE user
    if not user:
        print("No existing user found for company. Creating new CSR user.")
        user = User(
            email=email,
            role="CSR",
            company_id=company.id,
            password_hash=hashed_password,
            password_set=True,
        )
        db.add(user)
    else:
        print("Existing user found for company. Updating password.")
        user.password_hash = hashed_password
        user.password_set = True

    # 6️⃣ Save
    await db.commit()

    return {"message": "CSR password set successfully"}


@router.post("/set-ngo-password")
async def set_ngo_password(
    data: SetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    # 1️⃣ Decode token
    print("Received token for NGO password setup:", data.token)

    payload = jwt.decode(
        data.token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )

    print("Decoded token payload:", payload)

    email = payload.get("sub")
    role = payload.get("role")
    ngo_uid = payload.get("ngo_uid")

    if role != "NGO" or not ngo_uid:
        raise HTTPException(status_code=400, detail="Invalid invitation token")

    print("Token is valid. Proceeding with NGO password setup for UID:", ngo_uid)

    # 2️⃣ Fetch NGO using ngo_uid
    result = await db.execute(
        select(NGO).where(NGO.ngo_uid == ngo_uid)
    )

    print("NGO fetch result:", result)

    ngo = result.scalar_one_or_none()

    print("NGO found for password setup:", ngo)

    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")

    # 3️⃣ Check if user already exists
    result = await db.execute(
        select(User).where(User.ngo_id == ngo.id)
    )

    print("User fetch result:", result)

    user = result.scalar_one_or_none()

    # 4️⃣ Hash password
    hashed_password = hash_password(data.password)

    print("Password hashed successfully for NGO email:", email)

    # 5️⃣ CREATE or UPDATE user
    if not user:
        print("No existing user found for NGO. Creating new NGO user.")
        user = User(
            email=email,
            role="NGO",
            ngo_id=ngo.id,
            password_hash=hashed_password,
            password_set=True,
        )
        db.add(user)
    else:
        print("Existing user found for NGO. Updating password.")
        user.password_hash = hashed_password
        user.password_set = True

    # 6️⃣ Save
    await db.commit()

    return {"message": "NGO password set successfully"}
