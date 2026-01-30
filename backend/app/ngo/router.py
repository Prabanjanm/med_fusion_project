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
    
    return await register_clinic(db, ngo_obj, data.official_email, data.clinic_name)



@router.post("/clinics/{clinic_id}/requirements")
async def add_clinic_requirement(
    clinic_id: int,
    item_name: str,
    quantity: int,
    notes: str | None = None,
    db=Depends(get_db),
    ngo=Depends(require_role("NGO"))
):
  

    req = ClinicRequirement(
        clinic_id=clinic_id,
        ngo_id=ngo["ngo_id"],
        item_name=item_name,
        quantity=quantity,
        notes=notes
    )

    db.add(req)
    await db.commit()

    return {"message": "Clinic requirement recorded"}
