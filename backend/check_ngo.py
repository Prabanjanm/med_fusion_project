import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.trusted_ngo import TrustedNGO
from app.core.config import settings

async def check_trusted_ngo():
    engine = create_async_engine(settings.DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        csr_num = "CSR12345678"
        result = await db.execute(select(TrustedNGO).where(TrustedNGO.csr_1_number == csr_num))
        ngo = result.scalar_one_or_none()
        
        if ngo:
            print(f"✅ FOUND NGO: {ngo.ngo_name}")
            print(f"Email in Registry: {ngo.official_email}")
            print(f"CSR-1: {ngo.csr_1_number}")
            print(f"80G: {ngo.has_80g}")
        else:
            print("❌ NGO NOT FOUND in registry!")
            
            # List all for debugging
            print("\nCurrent registry entries:")
            result = await db.execute(select(TrustedNGO))
            all_ngos = result.scalars().all()
            for n in all_ngos:
                print(f"- {n.ngo_name} ({n.csr_1_number}) | {n.official_email}")

if __name__ == "__main__":
    asyncio.run(check_trusted_ngo())
