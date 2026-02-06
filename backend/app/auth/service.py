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
        raise ValueError("Email not registered")

    if not user.password_set:
        raise ValueError("Account inactive / not verified. Please set password first.")

    if not verify_password(password, user.password_hash):
        raise ValueError("Incorrect password")

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

    elif user.role in ["AUDITOR", "ADMIN"]:  # ✅ Allow Auditors/Admins to login
        organization_verified = True

    if not organization_verified:
        raise ValueError(f"{user.role} not verified or not active")

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "company_id": user.company_id,
        "ngo_id": user.ngo_id,
        "clinic_id": user.clinic_id,
    })

    # CRITICAL: Frontend needs role in response to navigate to correct dashboard
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role.lower()  # Return role in lowercase (csr, ngo, clinic, auditor)
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






