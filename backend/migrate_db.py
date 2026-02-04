import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def migrate():
    if not DATABASE_URL:
        print("Error: DATABASE_URL not found in .env")
        return

    print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")
    engine = create_async_engine(DATABASE_URL)

    async with engine.begin() as conn:
        print("Checking/Adding missing columns to donation_allocations table...")
        
        # Add feedback column
        try:
            await conn.execute(text("ALTER TABLE donation_allocations ADD COLUMN feedback TEXT;"))
            print("✅ Added 'feedback' column.")
        except Exception as e:
            if "already exists" in str(e):
                print("ℹ️ 'feedback' column already exists.")
            else:
                print(f"❌ Error adding 'feedback': {e}")

        # Add quality_rating column
        try:
            await conn.execute(text("ALTER TABLE donation_allocations ADD COLUMN quality_rating INTEGER;"))
            print("✅ Added 'quality_rating' column.")
        except Exception as e:
            if "already exists" in str(e):
                print("ℹ️ 'quality_rating' column already exists.")
            else:
                print(f"❌ Error adding 'quality_rating': {e}")

    await engine.dispose()
    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
