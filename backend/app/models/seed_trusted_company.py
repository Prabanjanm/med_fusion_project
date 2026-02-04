from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.trusted_company import TrustedCompany
from app.db.database import SessionLocal


async def seed_trusted_companies():
    """
    Seeds predefined trusted companies into the registry.
    This should be executed once or idempotently.
    """
    async with SessionLocal() as db:

        trusted_companies = [
            {
                "company_name": "ABC Healthcare Ltd",
                "cin": "L12345TN2020PLC000001",
                "pan": "ABCDE1234F",
            },
            {
                "company_name": "XYZ Medical Services Pvt Ltd",
                "cin": "L67890MH2019PLC000002",
                "pan": "FGHIJ5678K",
            },
            {
                "company_name": "Tesla India Motors",
                "cin": "L99999KA2024PLC123456",
                "pan": "TESLA8899X",
            },
            {
                "company_name": "HealthCare Innovations Ltd",
                "cin": "L55555KA2025PLC999999",
                "pan": "HEALTH999P",
            },
            {
                "company_name": "Global Pharma Care",
                "cin": "L11111TN2025PLC000000",
                "pan": "PHARMA123G",
            },
        ]

        for data in trusted_companies:
            result = await db.execute(
                select(TrustedCompany).where(TrustedCompany.cin == data["cin"])
            )
            existing = result.scalar_one_or_none()

            if not existing:
                db.add(TrustedCompany(**data))

        await db.commit()
