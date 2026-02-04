import asyncio
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.clinic import Clinic
from app.auth.utils import hash_password
from sqlalchemy import select

async def fix_clinic():
    email = "city.clinic@gmail.com"
    password = "Clinic@123"
    print(f"Checking clinic: {email}")
    
    async with AsyncSessionLocal() as db:
        # 1. Check User
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        
        if not user:
            print("User not found. Check if it was ever registered.")
            return

        print(f"Found User. Role: {user.role}, Clinic ID: {user.clinic_id}")
        
        # 2. Check Clinic
        if user.clinic_id:
            res_c = await db.execute(select(Clinic).where(Clinic.id == user.clinic_id))
            clinic = res_c.scalar_one_or_none()
            if clinic:
                print(f"Found Clinic: {clinic.clinic_name}, Active: {clinic.is_active}")
                clinic.is_active = True
                print("Setting Clinic to Active...")
        
        # 3. Set Password
        user.password_hash = hash_password(password)
        user.password_set = True
        print(f"Setting password to: {password}")
        
        await db.commit()
        print("✅ Clinic user is now ready for login.")

if __name__ == "__main__":
    asyncio.run(fix_clinic())
