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
        existing = await db.execute(
            select(TrustedCompany).where(
                TrustedCompany.cin == "L12345TN2020PLC000001"
            )
        )

        if existing.scalar_one_or_none():
            return  # Already seeded

        company = TrustedCompany(
            company_name="ABC Healthcare Ltd",
            cin="L12345TN2020PLC000001",
            pan="ABCDE1234F",
           
        )

        db.add(company)
        await db.commit()
