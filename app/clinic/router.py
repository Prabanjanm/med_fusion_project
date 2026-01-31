# app/clinic/router.py
from fastapi import APIRouter, Depends
from app.db.deps import get_db
from app.core.security import require_role
from app.clinic.service import confirm_receipt
from app.clinic.schema import ConfirmReceiptResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.donation_allocation import DonationAllocation   
from app.models.clinic_requirment import ClinicRequirement

router = APIRouter(prefix="/clinic", tags=["Clinic"])


@router.get("/allocations/pending")
async def get_pending_allocations(
    user=Depends(require_role("CLINIC")),
    db: AsyncSession = Depends(get_db)
):
    clinic_id = user["clinic_id"]

    result = await db.execute(
        select(DonationAllocation)
        .join(ClinicRequirement, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .where(ClinicRequirement.clinic_id == clinic_id)
        .where(DonationAllocation.received == False)
    )

    return result.scalars().all()


@router.post(
    "/allocations/{allocation_id}/confirm",
    response_model=ConfirmReceiptResponse
)
async def confirm_allocation_receipt(
    allocation_id: int,
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await confirm_receipt(db, clinic_user, allocation_id)

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_role
from app.clinic.service import get_clinic_allocation_history
from app.clinic.schema import ClinicAllocationHistory




@router.get(
    "/allocations",
    response_model=list[ClinicAllocationHistory]
)
async def clinic_allocations(
    db: AsyncSession = Depends(get_db),
    clinic_user: dict = Depends(require_role("CLINIC"))
):
    return await get_clinic_allocation_history(db, clinic_user)
