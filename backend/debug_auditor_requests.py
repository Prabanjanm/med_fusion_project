import requests
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.company import Company
from app.models.ngo import NGO
import asyncio

BASE_URL = "http://localhost:8000"

async def check_db_directly():
    print("\n🔹 Checking Database Directly...")
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Company).where(Company.is_verified == None))
        companies = result.scalars().all()
        print(f"   Pending Companies: {len(companies)}")
        for c in companies:
            print(f"    - {c.company_name} (ID: {c.id}, Verified: {c.is_verified})")

async def check_api():
    print("\n🔹 Checking API Endpoint (/admin/companies/requests)...")
    try:
        # Assuming admin/auditor login is not strictly enforced for this GET endpoint yet?
        # Or I need a token.
        # Let's try getting a token first.
        
        login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin@csr.gov.in", "password": "Admin@123"})
        if login_res.status_code != 200:
            print(f"❌ Admin Login Failed: {login_res.status_code}")
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Now call the API
        res = requests.get(f"{BASE_URL}/admin/companies/requests", headers=headers)
        
        if res.status_code == 200:
            data = res.json()
            print(f"✅ API Success! Found {len(data)} pending requests.")
            print(f"   Data: {data}")
        else:
            print(f"❌ API Failed: {res.status_code}")
            print(f"   Response: {res.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_db_directly())
    # check_api() # Uncomment if you want to test API over HTTP
