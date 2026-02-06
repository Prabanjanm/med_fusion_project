from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.deps import get_db
from app.ngo.schema import NGORegister, ClinicCreate, ClinicNeedCreate, AllocationCreate
from app.ngo.service import (
    accept_csr_donation, 
    register_and_verify_ngo,
    check_ngo_acceptance_eligibility,
    register_clinic,
    create_clinic_need,
    get_current_ngo,
    get_available_donations,
    get_accepted_donations,
    get_clinic_requirements,
    allocate_donation,
    get_allocation_history
)
from app.models.ngo import NGO
from app.models.clinic import Clinic
from app.core.security import require_role

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


@router.get("/clinics")
async def get_clinics(
    db=Depends(get_db),
    ngo=Depends(require_role("NGO"))
):
    """List all clinics registered by this NGO"""
    result = await db.execute(
        select(Clinic).where(Clinic.ngo_id == ngo["ngo_id"])
    )
    clinics = result.scalars().all()
    return clinics


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


@router.post("/donations/{donation_id}/accept")
async def accept_donation_endpoint(
    donation_id: int,
    db = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await accept_csr_donation(db, ngo, donation_id)


@router.get("/donations/available")
async def list_available_donations(
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await get_available_donations(db)


@router.get("/dashboard/data")
async def ngo_dashboard_data(
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return {
        "accepted_donations": await get_accepted_donations(db, ngo),
        "clinic_requirements": await get_clinic_requirements(db, ngo),
    }


@router.post("/donations/allocate")
async def allocate_donation_endpoint(
    payload: AllocationCreate,
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await allocate_donation(
        db,
        ngo,
        payload.donation_id,
        payload.clinic_requirement_id
    )


@router.get("/allocations/history")
async def allocation_history_endpoint(
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await get_allocation_history(db, ngo)
