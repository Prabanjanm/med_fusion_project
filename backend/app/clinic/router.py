# app/clinic/router.py
from fastapi import APIRouter, Depends
from app.db.deps import get_db
from app.clinic.service import set_clinic_password

router = APIRouter(prefix="/clinic", tags=["Clinic"])

@router.post("/set-password")
async def set_password(email: str, password: str, db=Depends(get_db)):
    return await set_clinic_password(db, email, password)
