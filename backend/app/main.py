from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import logging
from pathlib import Path

# --------------------------------------------------
# 🔹 Logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# 🔹 Path Configuration (Absolute)
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
ASSETS_DIR = STATIC_DIR / "assets"
INDEX_HTML = STATIC_DIR / "index.html"

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
# DEBUG: Print static directory contents (DIAGNOSTIC)
print(f"DEBUG: BASE_DIR={BASE_DIR}")
print(f"DEBUG: STATIC_DIR={STATIC_DIR}")
print(f"DEBUG: INDEX_HTML={INDEX_HTML}")
if STATIC_DIR.exists():
    print(f"DEBUG: Listing {STATIC_DIR}:")
    for f in STATIC_DIR.rglob("*"):
        print(f"  - {f}")
else:
    print(f"DEBUG: STATIC_DIR does not exist!")

app = FastAPI(title="CSR HealthTrace")

# --------------------------------------------------
# 🔹 CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    # Allow all for robustness since frontend is served from origin, 
    # but exact matches are fine too. Wildcard is easiest for hybrid.
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# 🔹 Request logging
# --------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Status: {response.status_code}")
    return response

# --------------------------------------------------
# 🔹 Exception handlers (Global Only)
# --------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

# --------------------------------------------------
# 🔹 Health check (API)
# --------------------------------------------------
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
# 🔹 Serve Frontend (React SPA)
# --------------------------------------------------

# 1. Mount Assets Explicitly (Performance & correctness)
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 2. explicit Root Handler (Handles "/" exactly)
@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def root():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    return JSONResponse(status_code=404, content={"message": "Frontend index.html not found"})

# 3. SPA Catch-All Handler (Must be LAST)
@app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_spa(full_path: str):
    # Check for direct file match First
    file_path = STATIC_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for React Routes
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
        
    return JSONResponse(status_code=404, content={"message": "Frontend not found"})
