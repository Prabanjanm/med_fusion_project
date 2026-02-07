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
# 🔹 Path Configuration (Absolute & Safe)
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
# 🔹 App init
# --------------------------------------------------
app = FastAPI(title="CSR HealthTrace")

print("DEBUG: Loaded main.py with confirmed debug-files endpoint (v2)")

@app.get("/debug-files")
async def debug_files():
    import os
    files = []
    if STATIC_DIR.exists():
        for f in STATIC_DIR.rglob("*"):
            files.append(str(f))
    return {
        "base_dir": str(BASE_DIR),
        "static_dir": str(STATIC_DIR),
        "exists": STATIC_DIR.exists(),
        "files": files
    }

# --------------------------------------------------
# 🔹 CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # safe since frontend is same-origin
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
# 🔹 Global exception handler (NO StarletteHTTPException!)
# --------------------------------------------------
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
# 🔹 API Routers (PREFIXED via Router definitions)
# --------------------------------------------------
# We include routers that ALREADY have prefix="..." defined in their files.
# This prevents routers from accidentally capturing root paths.
app.include_router(auth_router)       # prefix="/auth"
app.include_router(company_router)    # prefix="/companies"
app.include_router(donation_router)   # prefix="/donations"
app.include_router(ngo_router)        # prefix="/ngo"
app.include_router(clinic_router)     # prefix="/clinic"
app.include_router(admin_router)      # prefix="/admin"

# --------------------------------------------------
# 🔹 Serve Frontend (React SPA)
# --------------------------------------------------

@app.get("/debug-files")
async def debug_files():
    import os
    files = []
    if STATIC_DIR.exists():
        for f in STATIC_DIR.rglob("*"):
            files.append(str(f))
    return {
        "base_dir": str(BASE_DIR),
        "static_dir": str(STATIC_DIR),
        "exists": STATIC_DIR.exists(),
        "files": files
    }

# 1️⃣ Serve assets explicitly
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 2️⃣ Root route (GET + HEAD for Render health checks)
@app.api_route("/", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_root():
    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)
    return JSONResponse(status_code=404, content={"message": "index.html not found"})

# 3️⃣ SPA Catch-All (MUST BE LAST)
@app.api_route("/{full_path:path}", methods=["GET", "HEAD"], include_in_schema=False)
async def serve_spa(full_path: str):
    file_path = STATIC_DIR / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)

    if INDEX_HTML.exists():
        return FileResponse(INDEX_HTML)

    return JSONResponse(status_code=404, content={"message": "Frontend not found"})
