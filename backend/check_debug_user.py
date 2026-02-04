
import asyncio
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.clinic import Clinic

async def check_user_state(email: str):
    async with AsyncSessionLocal() as db:
        user_res = await db.execute(select(User).where(User.email == email))
        user = user_res.scalar_one_or_none()
        
        clinic_res = await db.execute(select(Clinic).where(Clinic.official_email == email))
        clinic = clinic_res.scalar_one_or_none()
        
        print(f"--- STATE FOR {email} ---")
        if user:
            print(f"User Record Found: ID={user.id}, Role={user.role}, PasswordSet={getattr(user, 'password_set', 'N/A')}")
        else:
            print("No User Record Found.")
            
        if clinic:
            print(f"Clinic Record Found: ID={clinic.id}, Name={clinic.clinic_name}, Active={clinic.is_active}")
        else:
            print("No Clinic Record Found.")

if __name__ == "__main__":
    email = "aiswaryam.cse2024@citchennai.net"
    asyncio.run(check_user_state(email))
