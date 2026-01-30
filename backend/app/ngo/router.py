from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.deps import get_db
from app.ngo.schema import NGORegister, ClinicCreate
from app.ngo.service import register_and_verify_ngo
from app.core.security import require_role
from app.ngo.service import check_ngo_acceptance_eligibility
from app.ngo.accept_service import accept_donation_safely
from app.ngo.service import register_clinic
from app.models.clinic_requirment import ClinicRequirement
from app.models.ngo import NGO
from app.core.security import require_role
from app.ngo.schema import ClinicNeedCreate
from app.ngo.service import create_clinic_need , get_current_ngo
from app.db.deps import get_db

router = APIRouter(
    prefix="/ngo",
    tags=["NGO"]
)


@router.post("/register", summary="Register and verify NGO")
async def register_ngo(
    data: NGORegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        ngo = await register_and_verify_ngo(db, data)
        return {
            "message": "NGO verified successfully. Please set password.",
            "ngo_id": ngo.id
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))





@router.get("/donations/{donation_id}/eligibility")
async def check_donation_eligibility(
    donation_id: int,
    user=Depends(require_role("NGO")),
    db=Depends(get_db)
):
    """
    Check whether the NGO is eligible to accept a CSR donation.
    """
    return await check_ngo_acceptance_eligibility(
        db=db,
        donation_id=donation_id,
        ngo_id=user["ngo_id"]
    )


# ---------------------------------------------
# 2️⃣ Accept donation safely
# ---------------------------------------------
@router.post("/donations/{donation_id}/accept")
async def accept_donation(
    donation_id: int,
    user=Depends(require_role("NGO")),
    db=Depends(get_db)
):
    """
    Accept a CSR donation after passing all safety checks.
    """
    return await accept_donation_safely(
        db=db,
        donation_id=donation_id,
        ngo_id=user["ngo_id"]
    )

@router.post("/clinics")
async def register_clinic_endpoint(
    data: ClinicCreate,
    db=Depends(get_db),
    ngo=Depends(require_role("NGO"))
):
    # Fetch the full NGO object
    result = await db.execute(select(NGO).where(NGO.id == ngo["ngo_id"]))
    ngo_obj = result.scalar_one_or_none()
    if not ngo_obj:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    return await register_clinic(db, ngo_obj, data.official_email, data.clinic_name,data.facility_id, data.facility_id_type, data.doctor_registration_number, data.pincode)



@router.post("/clinic-needs")
async def create_need(
    data: ClinicNeedCreate,
    db=Depends(get_db),
    ngo=Depends(get_current_ngo),
    _: dict = Depends(require_role("NGO"))
):
    """
    NGO records a clinic requirement after physical audit.
    Clinic must be onboarded before allocation.
    """
    return await create_clinic_need(db, ngo, data)


