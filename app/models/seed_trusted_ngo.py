from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.trusted_ngo import TrustedNGO


async def seed_trusted_ngos(db: AsyncSession):
    """
    Seed trusted NGO registry.
    This simulates official CSR-1 + 80G approved NGOs.
    Runs safely (no duplicates).
    """

    ngos = [
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
        }
    ]

    for ngo in ngos:
        result = await db.execute(
            select(TrustedNGO).where(
                TrustedNGO.csr_1_number == ngo["csr_1_number"]
            )
        )
        exists = result.scalar_one_or_none()

        if not exists:
            db.add(TrustedNGO(**ngo))

    await db.commit()
