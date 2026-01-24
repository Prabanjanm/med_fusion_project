from fastapi import FastAPI
from app.auth.router import router as auth_router
from fastapi import Depends
from app.core.security import require_role
from app.donations.router import router as donation_router

app = FastAPI(title="CSR HealthTrace")

app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/secure-test")
def secure_test(_: dict = Depends(require_role("CSR"))):
    return {"message": "Authorized access"}



app.include_router(donation_router)

