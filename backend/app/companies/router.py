from select import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.companies.schema import CompanyRegister
from app.companies.service import register_company
from app.models.donation import Donation
from app.models.donation_allocation import DonationAllocation

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post("/register")
async def register_company_endpoint(
    data: CompanyRegister,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await register_company(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/dashboard")
async def csr_dashboard(
    company_id: int,
    db: AsyncSession = Depends(get_db),
):
    donations = await db.execute(
        select(Donation).where(Donation.company_id == company_id)
    )
    donation_rows = donations.scalars().all()

    allocations = await db.execute(
        select(DonationAllocation)
    )
    allocation_rows = allocations.scalars().all()

    return {
        "company_id": company_id,
        "kpis": {
            "total_donations": len(donation_rows),
            "total_allocations": len(allocation_rows),
            "clinics_supported": len(
                set(a.clinic_requirement_id for a in allocation_rows)
            ),
        }
    }
