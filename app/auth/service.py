from sqlalchemy import select, or_
from app.models.user import User
from app.models.company import Company
from app.models.ngo import NGO
from app.models.clinic import Clinic
from app.auth.utils import verify_password, create_access_token, hash_password


async def login_user(db, email: str, password: str):
    """
    Allow login for Company, NGO, or Clinic users if:
    - Organization (company/ngo/clinic) is verified
    - password is set
    """

    # Get user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise ValueError("Invalid email or password")

    print("LOGIN ATTEMPT:", email)
    print("PASSWORD SET:", user.password_set)
    print("USER ROLE:", user.role)

    if not user.password_set:
        raise ValueError("Password not set. Please set password first.")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    # Verify organization based on role
    organization_verified = False

    if user.role == "CSR" and user.company_id:
        result = await db.execute(select(Company).where(Company.id == user.company_id))
        company = result.scalar_one_or_none()
        if company:
            organization_verified = company.is_verified
            print("COMPANY VERIFIED:", organization_verified)

    elif user.role == "NGO" and user.ngo_id:
        result = await db.execute(select(NGO).where(NGO.id == user.ngo_id))
        ngo = result.scalar_one_or_none()
        if ngo:
            organization_verified = ngo.is_verified
            print("NGO VERIFIED:", organization_verified)

    elif user.role == "CLINIC" and user.clinic_id:
        result = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
        clinic = result.scalar_one_or_none()
        if clinic:
            organization_verified = clinic.is_active
            print("CLINIC ACTIVE:", organization_verified)

    if not organization_verified:
        raise ValueError(f"{user.role} not verified or not active")

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "company_id": user.company_id,
        "ngo_id": user.ngo_id,
        "clinic_id": user.clinic_id,
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


async def set_password(db, email: str, password: str):
    """
    Set password for a verified organization's user (Company, NGO, or Clinic).
    """

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise ValueError("User not found")

    if user.password_set:
        raise ValueError("Password already set")

    # Verify organization exists based on role
    organization_exists = False

    if user.role == "CSR" and user.company_id:
        result = await db.execute(select(Company).where(Company.id == user.company_id))
        organization_exists = result.scalar_one_or_none() is not None

    elif user.role == "NGO" and user.ngo_id:
        result = await db.execute(select(NGO).where(NGO.id == user.ngo_id))
        organization_exists = result.scalar_one_or_none() is not None

    elif user.role == "CLINIC" and user.clinic_id:
        result = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
        organization_exists = result.scalar_one_or_none() is not None

    if not organization_exists:
        raise ValueError(f"Organization not found for {user.role}")

    user.password_hash = hash_password(password)
    user.password_set = True

    await db.commit()

    return {"message": "Password set successfully. You can now login."}


from jose import jwt, JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.user import User


async def set_password_from_token(
    db: AsyncSession,
    token: str,
    expected_role: str,
):
    payload = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM],
    )

    email = payload.get("sub")
    role = payload.get("role")
    company_id = payload.get("company_id")
    print("Decoded token payload:", payload)
    if not email or role != expected_role or not company_id:
        raise HTTPException(status_code=400, detail="Invalid invitation token")

    result = await db.execute(
        select(Company).where(Company.id == company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    return company, email

    return user




