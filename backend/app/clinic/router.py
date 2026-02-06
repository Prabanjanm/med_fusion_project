from app.db.deps import get_db
from app.core.security import require_role
from app.clinic.service import confirm_receipt, get_clinic_requests, create_clinic_requirement, get_clinic_allocation_history
from app.clinic.schema import ConfirmReceiptResponse, RequirementCreate, ClinicAllocationHistory, ConfirmReceiptRequest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.donation_allocation import DonationAllocation   
from app.models.clinic_requirment import ClinicRequirement
from app.models.donation import Donation
from app.models.ngo import NGO
from app.models.clinic import Clinic
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/clinic", tags=["Clinic"])


@router.get("/allocations/pending")
async def get_pending_allocations(
    user=Depends(require_role("CLINIC")),
    db: AsyncSession = Depends(get_db)
):
    clinic_id = user.get("clinic_id")
    if not clinic_id:
        print("DEBUG: clinic_id missing from user token payload")
        return []

    print(f"DEBUG: Fetching pending allocations for clinic_id={clinic_id}")
    
    # Improved query with explicit joining and filtering
    query = (
        select(
            DonationAllocation.id,
            Donation.item_name,
            Donation.quantity,
            NGO.ngo_name,
            DonationAllocation.allocated_at
        )
        .join(ClinicRequirement, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .join(Donation, DonationAllocation.donation_id == Donation.id)
        .join(NGO, ClinicRequirement.ngo_id == NGO.id)
        .where(ClinicRequirement.clinic_id == clinic_id)
        .where(DonationAllocation.received == False)
        .order_by(DonationAllocation.allocated_at.desc())
    )

    result = await db.execute(query)
    rows = result.all()
    
    print(f"DEBUG: Found {len(rows)} pending allocations in database")
    
    return [
        {
            "id": r.id,
            "item_name": r.item_name,
            "quantity": r.quantity,
            "ngo_name": r.ngo_name,
            "allocated_at": r.allocated_at
        }
        for r in rows
    ]


@router.post(
    "/allocations/{allocation_id}/confirm",
    response_model=ConfirmReceiptResponse
)
async def confirm_allocation_receipt(
    allocation_id: int,
    payload: ConfirmReceiptRequest,
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await confirm_receipt(db, clinic_user, allocation_id, payload)


@router.get(
    "/allocations",
    response_model=list[ClinicAllocationHistory]
)
async def clinic_allocations(
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await get_clinic_allocation_history(db, clinic_user)

@router.get("/requests")
async def clinic_requests(
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await get_clinic_requests(db, clinic_user)

@router.post("/requirements")
async def create_requirement(
    payload: RequirementCreate,
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await create_clinic_requirement(db, clinic_user, payload)

@router.delete("/requirements/{requirement_id}")
async def delete_requirement_endpoint(
    requirement_id: int,
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    from app.clinic.service import delete_clinic_requirement
    return await delete_clinic_requirement(db, clinic_user, requirement_id)

@router.get("/ngo-inventory")
async def get_ngo_inventory_endpoint(
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    from app.clinic.service import get_supervising_ngo_inventory
    return await get_supervising_ngo_inventory(db, clinic_user)
