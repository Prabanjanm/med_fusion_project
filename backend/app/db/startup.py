from sqlalchemy import select
from app.models.trusted_company import TrustedCompany


async def seed_trusted_companies(db):
    """
    Seed trusted companies if table is empty.
    Runs once on startup.
    """
    result = await db.execute(select(TrustedCompany))
    if result.first():
        return

    companies = [
        TrustedCompany(
            company_name="ABC Healthcare Ltd",
            cin="L12345TN2020PLC000001",
            pan="ABCDE1234F"
        ),
        TrustedCompany(
            company_name="Global Med Supplies",
            cin="L67890MH2019PLC000002",
            pan="FGHIJ5678K"
        )
    ]

    db.add_all(companies)
    await db.commit()
