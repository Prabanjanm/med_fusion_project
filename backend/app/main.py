from fastapi import FastAPI
from app.auth.router import router as auth_router
from app.companies.router import router as company_router
from app.donations.router import router as donation_router
from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.db.startup import seed_trusted_companies, seed_trusted_ngos

# Import all models so SQLAlchemy knows about them for table creation
from app.models.company import Company
from app.models.clinic import Clinic
from app.models.ngo import NGO
from app.models.user import User
from app.models.trusted_company import TrustedCompany
from app.models.trusted_ngo import TrustedNGO
from app.models.donation import Donation
from app.models.clinic_invitation import ClinicInvitation
from app.models.clinic_requirment import ClinicRequirement
from app.models.password_set_jwt import PasswordSetupToken

app = FastAPI(title="CSR HealthTrace")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_trusted_companies(db)

    async with AsyncSessionLocal() as db:
        await seed_trusted_ngos(db)


app.include_router(auth_router)
app.include_router(company_router)
app.include_router(donation_router)

from app.ngo.router import router as ngo_router

app.include_router(ngo_router)
