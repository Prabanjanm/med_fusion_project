from sqlalchemy import select, text
from app.models.trusted_company import TrustedCompany

from app.models.trusted_ngo import TrustedNGO
from app.models.user import User
from app.auth.utils import hash_password


async def seed_trusted_companies(db):
    """
    Seed trusted companies if table is empty.
    Runs once on startup.
    """
    companies_data = [
        {
            "company_name": "ABC Healthcare Ltd",
            "cin": "L12345TN2020PLC000001",
            "pan": "ABCDE1234F"
        },
        {
            "company_name": "XYZ Medical Services Pvt Ltd",
            "cin": "L67890MH2019PLC000002",
            "pan": "FGHIJ5678K"
        },
        {
            "company_name": "Tesla India Motors",
            "cin": "L99999KA2024PLC123456",
            "pan": "TESLA8899X"
        },
        {
            "company_name": "TATA Steel CSR",
            "cin": "L27100MH1907PLC000260",
            "pan": "AAACT2222N"
        },
        {
            "company_name": "HealthCare Innovations Ltd",
            "cin": "L55555KA2025PLC999999",
            "pan": "HEALTH999P"
        },
        {
            "company_name": "Global Pharma Care",
            "cin": "L11111TN2025PLC000000",
            "pan": "PHARMA123G"
        }
    ]

    for data in companies_data:
        # Check if CIN already exists
        result = await db.execute(select(TrustedCompany).where(TrustedCompany.cin == data["cin"]))
        if not result.scalar_one_or_none():
            db.add(TrustedCompany(**data))

    await db.commit()




async def seed_trusted_ngos(db):
    """
    Seed trusted NGOs based on CSR-1 number.
    Runs once on startup.
    """
    ngos_data = [
        {
            "ngo_name": "Health Reach Foundation",
            "csr_1_number": "CSR00012345",
            "has_80g": True,
            "official_email": "contact@healthreach.org"
        },
        {
            "ngo_name": "Rural Care Trust",
            "csr_1_number": "CSR00054321",
            "has_80g": True,
            "official_email": "info@ruralcaretrust.org"
        },
        {
            "ngo_name": "LifeLine Medical Aid",
            "csr_1_number": "CSR00067890",
            "has_80g": False,
            "official_email": "admin@lifelinemed.org"
        },
        {
            "ngo_name": "Global Health Initiative",
            "csr_1_number": "CSR00099999",
            "has_80g": True,
            "official_email": "verify@globalhealth.org"
        },
        {
            "ngo_name": "Ideafor Medical Lmt",
            "csr_1_number": "CSR12345678",
            "has_80g": True,
            "official_email": "aiswaryam.cse2024@citchennai.net"
        }
    ]

    for data in ngos_data:
        result = await db.execute(select(TrustedNGO).where(TrustedNGO.csr_1_number == data["csr_1_number"]))
        existing = result.scalar_one_or_none()
        if not existing:
            db.add(TrustedNGO(**data))
        else:
            # Sync email if it changed in the code
            if existing.official_email != data["official_email"]:
                existing.official_email = data["official_email"]

    await db.commit()


async def seed_admin(db):
    """Create default admin/auditor if not exists"""
    result = await db.execute(select(User).where(User.role == "AUDITOR"))
    if result.first():
        return

    admin = User(
        email="admin@csr.gov.in",
        role="AUDITOR",
        password_set=True,
        password_hash=hash_password("Admin@123")
    )
    db.add(admin)
    await db.commit()


async def fix_missing_columns(db):
    """
    Ensure missing columns exist in the database.
    This handles schema evolution without Alembic for simple additions.
    """
    # Fix for donation_allocations table
    try:
        # Use simple ALTER TABLE commands.
        await db.execute(text("ALTER TABLE donation_allocations ADD COLUMN IF NOT EXISTS feedback TEXT;"))
        await db.execute(text("ALTER TABLE donation_allocations ADD COLUMN IF NOT EXISTS quality_rating INTEGER;"))
        
        # Sync for donations table
        await db.execute(text("ALTER TABLE donations ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;"))
        
        await db.commit()
    except Exception as e:
        print(f"Schema update notice: {e}")
        await db.rollback()

