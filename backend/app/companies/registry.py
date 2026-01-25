from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.trusted_company import TrustedCompany


async def validate_company_against_registry(
    db: AsyncSession,
    cin: str,
    pan: str,
    email_domain: str
):
    """
    Validates company details against trusted registry.
    """
    stmt = select(TrustedCompany).where(
        TrustedCompany.cin == cin,
        TrustedCompany.pan == pan,
        TrustedCompany.official_email_domain == email_domain,
        TrustedCompany.is_active.is_(True)
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()
