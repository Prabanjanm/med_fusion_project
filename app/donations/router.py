from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.core.security import require_role
from app.donations.schema import DonationCreate
from app.donations.service import create_donation
from app.donations.service import get_csr_donation_history
from app.donations.service import get_csr_dashboard_analytics

router = APIRouter(
    prefix="/donations",
    tags=["Donations"]
)


@router.post("/", summary="Create a CSR-authorized donation")
async def create_donation_endpoint(
    data: DonationCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("CSR"))
):
    result = await create_donation(
        db=db,
        data=data,
        company_id=user["company_id"]
    )

    return {
        "donation_id": result["donation"].id,
        "status": result["donation"].status,
        "created_at": result["donation"].created_at,
         "audit": {
            "tx_hash": result["audit"]["tx_hash"],
            "block_number": result["audit"]["block_number"],
            "status": result["audit"]["status"]
        }
    }


@router.get(
    "/history",
    summary="CSR donation history"
)
async def donation_history(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("CSR"))
):
    donations = await get_csr_donation_history(
        db=db,
        company_id=user["company_id"]
    )

    return [
        {
            "donation_id": d.id,
            "item_name": d.item_name,
            "quantity": d.quantity,
            "purpose": d.purpose,
            "status": d.status,
            "created_at": d.created_at
        }
        for d in donations
    ]


@router.get(
    "/analytics",
    summary="CSR dashboard analytics"
)
async def csr_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("CSR"))
):
    return await get_csr_dashboard_analytics(
        db=db,
        company_id=user["company_id"]
    )
