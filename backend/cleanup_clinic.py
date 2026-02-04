
import asyncio
from sqlalchemy import delete
from app.db.database import AsyncSessionLocal
from app.models.user import User
from app.models.clinic import Clinic
from app.models.clinic_invitation import ClinicInvitation

async def cleanup_user(email: str):
    async with AsyncSessionLocal() as db:
        # Delete from User table
        await db.execute(delete(User).where(User.email == email))
        # Delete from Clinic table
        await db.execute(delete(Clinic).where(Clinic.official_email == email))
        # Delete invitations
        await db.execute(delete(ClinicInvitation).where(ClinicInvitation.clinic_email == email))
        
        await db.commit()
        print(f"--- CLEANUP COMPLETE FOR {email} ---")
        print("You can now onboard this clinic as a fresh user.")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "aiswaryam.cse2024@citchennai.net"
    asyncio.run(cleanup_user(email))
