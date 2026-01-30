from sqlalchemy import select
from app.models.trusted_company import TrustedCompany

from app.models.trusted_ngo import TrustedNGO


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
    Seed trusted NGOs if table is empty.
    Runs once on startup.
    """

    result = await db.execute(select(TrustedNGO))
    if result.first():
        return

    ngos = [
        TrustedNGO(
            ngo_name="Health Reach Foundation",
            csr_1_number="CSR00012345",
            has_80g=True,
            official_email="contact@healthreach.org"
        ),
        TrustedNGO(
            ngo_name="Rural Care Trust",
            csr_1_number="CSR00054321",
            has_80g=True,
            official_email="info@ruralcaretrust.org"
        ),
        TrustedNGO(
            ngo_name="LifeLine Medical Aid",
            csr_1_number="CSR00067890",
            has_80g=False,
            official_email="admin@lifelinemed.org"
        )
    ]

    db.add_all(ngos)
    await db.commit()

