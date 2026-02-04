from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.company import Company
from app.models.user import User
from app.models.trusted_company import TrustedCompany
from app.auth.utils import hash_password


async def register_company(db: AsyncSession, data):
    """
    Register company only once using CIN.
    Verify against trusted registry before creation.
    """

    # 1️⃣ Check trusted registry
    trusted = await db.execute(
        select(TrustedCompany).where(
            TrustedCompany.cin == data.cin,
            TrustedCompany.pan == data.pan
        )
    )
    if not trusted.scalar_one_or_none():
        raise ValueError("Company not found in trusted registry")

    # 2️⃣ Check if company already registered
    existing_company = await db.execute(
        select(Company).where(Company.cin == data.cin)
    )
    company = existing_company.scalar_one_or_none()

    if company:
        return {
            "message": "Company already registered",
            "next_step": "Please login or set password using your official email",
            "company_id": company.id
        }

    # 3️⃣ Create new company (Pending Verification)
    company = Company(
        company_name=data.company_name,
        cin=data.cin,
        pan=data.pan,
        is_verified=None  # ✅ Changed from True to None (Pending Auditor Review)
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)

    # 4️⃣ Create user (if not exists)
    existing_user = await db.execute(
        select(User).where(User.email == data.official_email)
    )
    if not existing_user.scalar_one_or_none():
        user = User(
            email=data.official_email,
            company_id=company.id,
            password_set=bool(data.password),  # Set to True if password provided
            password_hash=hash_password(data.password) if data.password else None,
            role="CSR"
        )
        db.add(user)
        await db.commit()

    return {
        "message": "Registration successful. Pending Auditor Approval.",
        "next_step": "You will be notified once the Auditor approves your account."
    }
