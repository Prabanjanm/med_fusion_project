import asyncio
from app.db.database import AsyncSessionLocal
from app.models.ngo import NGO
from app.models.user import User
from sqlalchemy import select

async def diagnose_ngo():
    email = "verify@globalhealth.org"
    print(f"--- Diagnostic Report for {email} ---")
    
    async with AsyncSessionLocal() as db:
        # 1. Check User Table
        user_res = await db.execute(select(User).where(User.email == email))
        user = user_res.scalar_one_or_none()
        
        if not user:
            print("❌ USER RECORD: Missing (Registration likely failed)")
        else:
            print(f"✅ USER RECORD: Found")
            print(f"   - Role: {user.role}")
            print(f"   - Password Set: {user.password_set}")
            print(f"   - NGO ID: {user.ngo_id}")

        # 2. Check NGO Table
        ngo_res = await db.execute(select(NGO).where(NGO.official_email == email))
        ngo = ngo_res.scalar_one_or_none()
        
        if not ngo:
            print("❌ NGO RECORD: Missing")
        else:
            print(f"✅ NGO RECORD: Found")
            print(f"   - Name: {ngo.ngo_name}")
            print(f"   - Verified Status: {ngo.is_verified}")
            
            if ngo.is_verified is None or ngo.is_verified is False:
                print("\n⚠️  ISSUE FOUND: NGO is NOT YET APPROVED by the Auditor.")
                print("   Action: Login as Auditor (admin@csr.gov.in) and approve this request.")
            elif user and user.password_set is False:
                print("\n⚠️  ISSUE FOUND: Password is not set for this user.")

if __name__ == "__main__":
    asyncio.run(diagnose_ngo())
