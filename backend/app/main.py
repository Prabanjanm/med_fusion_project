from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.auth.router import router as auth_router
from app.companies.router import router as company_router
from app.donations.router import router as donation_router
from app.ngo.router import router as ngo_router
from app.clinic.router import router as clinic_router
from app.admin.router import router as admin_router

from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.db.startup import (
    seed_trusted_companies,
    seed_trusted_ngos,
    seed_admin,
    fix_missing_columns,
    seed_clinics,
)

# 🔹 Import models so SQLAlchemy registers them
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

# --------------------------------------------------
# 🔹 App init
# --------------------------------------------------
app = FastAPI(title="CSR HealthTrace")

# --------------------------------------------------
# 🔹 CORS (FIXED + GUARANTEED)
# --------------------------------------------------
ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "https://csr-healthtrace-3fzy.onrender.com",
    "https://csr-healthtrace-frontend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Middleware caught error: {str(e)}", exc_info=True)
        raise e

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin")
    logger.warning(f"HTTP Error {exc.status_code}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": origin if origin in ORIGINS else ORIGINS[0],
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"FATAL ERROR: {str(exc)}", exc_info=True)
    origin = request.headers.get("origin")
    return JSONResponse(
        status_code=500,
        content={"detail": f"Backend Error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": origin if origin in ORIGINS else ORIGINS[0],
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.get("/ping")
async def ping():
    return {"status": "ok", "message": "Backend is reachable"}

# --------------------------------------------------
# 🔹 Startup (DB only)
# --------------------------------------------------
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_trusted_companies(db)

    async with AsyncSessionLocal() as db:
        await seed_trusted_ngos(db)
        await seed_admin(db)
        await fix_missing_columns(db)
        await seed_clinics(db)

# --------------------------------------------------
# 🔹 Routers
# --------------------------------------------------
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(donation_router)
app.include_router(ngo_router)
app.include_router(clinic_router)
app.include_router(admin_router)

# --------------------------------------------------
# 🔹 Static files
# --------------------------------------------------
app.mount("/static", StaticFiles(directory="app/static"), name="static")
