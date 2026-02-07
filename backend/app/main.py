from fastapi import FastAPI
from app.auth.router import router as auth_router
from app.companies.router import router as company_router
from app.donations.router import router as donation_router
from app.ngo.router import router as ngo_router
from app.clinic.router import router as clinic_router
from app.admin.router import router as admin_router
from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.db.startup import seed_trusted_companies, seed_trusted_ngos
from app.blockchain.ganache_runner import start_ganache



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
from app.models.admin_audit_log import AdminAuditLog

app = FastAPI(title="CSR HealthTrace")

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_trusted_companies(db)

    async with AsyncSessionLocal() as db:
        await seed_trusted_ngos(db)
    # start_ganache()


app.include_router(auth_router)
app.include_router(company_router)
app.include_router(donation_router)
app.include_router(ngo_router)
app.include_router(clinic_router)
app.include_router(admin_router)

from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="app/static"), name="static")
