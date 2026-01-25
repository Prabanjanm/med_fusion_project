from fastapi import FastAPI
from app.auth.router import router as auth_router
from app.companies.router import router as company_router
from app.donations.router import router as donation_router
from app.db.database import engine
from app.db.base import Base

app = FastAPI(title="CSR HealthTrace")
from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.db.startup import seed_trusted_companies

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_trusted_companies(db)


app.include_router(auth_router)
app.include_router(company_router)
app.include_router(donation_router)