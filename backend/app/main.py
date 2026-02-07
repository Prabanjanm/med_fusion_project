from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

# --------------------------------------------------
# 🔹 Logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# 🔹 Routers
# --------------------------------------------------
from app.auth.router import router as auth_router
from app.companies.router import router as company_router
from app.donations.router import router as donation_router
from app.ngo.router import router as ngo_router
from app.clinic.router import router as clinic_router
from app.admin.router import router as admin_router

# --------------------------------------------------
# 🔹 Database
# --------------------------------------------------
from app.db.database import engine, AsyncSessionLocal
from app.db.base import Base
from app.db.startup import (
    seed_trusted_companies,
    seed_trusted_ngos,
    seed_admin,
    fix_missing_columns,
    seed_clinics,
)

# --------------------------------------------------
# 🔹 Import models (IMPORTANT for SQLAlchemy)
# --------------------------------------------------
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
# 🔹 CORS (THE ONLY PLACE CORS IS HANDLED)
# --------------------------------------------------
# --------------------------------------------------
# 🔹 CORS (PERMISSIVE DEBUGGING MODE)
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Response
@app.options("/{full_path:path}")
async def preflight_handler(full_path: str):
    return Response(status_code=204)

# --------------------------------------------------
# 🔹 Request logging (SAFE)
# --------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response

# --------------------------------------------------
# 🔹 Exception handlers (NO CORS HERE)
# --------------------------------------------------
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTP {exc.status_code}: {exc.detail}")
    # Let CORSMiddleware handle headers naturally
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

# --------------------------------------------------
# 🔹 Health check
# --------------------------------------------------
@app.get("/ping")
async def ping():
    return {"status": "ok", "message": "Backend is reachable"}

@app.get("/")
async def root():
    return {
        "message": "Welcome to CSR HealthTrace API", 
        "status": "online", 
        "docs_url": "/docs"
    }

# --------------------------------------------------
# 🔹 Startup (DB only)
# --------------------------------------------------
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        await seed_trusted_companies(db)
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
