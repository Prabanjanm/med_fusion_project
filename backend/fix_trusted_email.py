import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, update
from app.models.trusted_ngo import TrustedNGO
from app.core.config import settings

async def force_update_trusted_email():
    engine = create_async_engine(settings.DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as db:
        csr_num = "CSR12345678"
        target_email = "aiswaryam.cse2024@citchennai.net"
        
        print(f"Checking Trusted Registry for CSR-1: {csr_num}...")
        
        result = await db.execute(select(TrustedNGO).where(TrustedNGO.csr_1_number == csr_num))
        ngo = result.scalar_one_or_none()
        
        if ngo:
            print(f"NGO found: {ngo.ngo_name}")
            print(f"Current Email in Registry: {ngo.official_email}")
            
            if ngo.official_email != target_email:
                print(f"Updating email to: {target_email}...")
                ngo.official_email = target_email
                await db.commit()
                print("✅ Email updated successfully!")
            else:
                print("✅ Email already matches the target.")
        else:
            print(f"❌ NGO with CSR-1 {csr_num} not found. Adding it now...")
            new_ngo = TrustedNGO(
                ngo_name="Ideafor Medical Lmt",
                csr_1_number=csr_num,
                has_80g=True,
                official_email=target_email
            )
            db.add(new_ngo)
            await db.commit()
            print("✅ New NGO added to registry!")

if __name__ == "__main__":
    asyncio.run(force_update_trusted_email())
