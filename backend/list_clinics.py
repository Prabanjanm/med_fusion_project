import asyncio
from app.db.database import AsyncSessionLocal
from app.models.user import User
from sqlalchemy import select

async def list_clinics():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.role == "CLINIC"))
        users = result.scalars().all()
        if not users:
            print("No clinic users found.")
        for user in users:
            print(f"Email: {user.email}, Password Set: {user.password_set}")

if __name__ == "__main__":
    asyncio.run(list_clinics())
