from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import os
from pathlib import Path

# --------------------------------------------------
# 🔹 Logging
# --------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------
# 🔹 Path Configuration (Robust)
# --------------------------------------------------
# Resolve paths relative to THIS file (app/main.py)
# structure: backend/app/main.py -> backend/app/static
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
ASSETS_DIR = STATIC_DIR / "assets"

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

# --------------------------------------------------
# 🔹 CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# 🔹 Routers
# --------------------------------------------------
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(donation_router)
app.include_router(ngo_router)
app.include_router(clinic_router)
app.include_router(admin_router)

# --------------------------------------------------
# 🔹 Serve Frontend (React Single Page App)
# --------------------------------------------------

# 1. Mount /assets explicitly if it exists
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 2. SPA Catch-All Handler
# This MUST be the last route defined.
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # API routes are already matched above, so we only get here for non-API requests.
    
    # 2a. Check if it's a specific static file request (e.g. /favicon.ico, /robots.txt)
    # We check if the file exists in the static directory.
    target_file = STATIC_DIR / full_path
    if target_file.exists() and target_file.is_file():
        return FileResponse(target_file)
    
    # 2b. Fallback to index.html for React Routing (if not found as file)
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
        
    return JSONResponse(status_code=404, content={"message": "Frontend not found on server"})
