from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.core.security import require_role
from app.donations.schema import DonationCreate
from app.donations.service import create_donation
from app.donations.service import get_csr_donation_history
from app.donations.service import get_csr_dashboard_analytics
from app.models.donation import Donation
from app.models.ngo import NGO

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
    result = await db.execute(
        select(Donation, NGO.ngo_name)
        .outerjoin(NGO, Donation.ngo_id == NGO.id)
        .where(Donation.company_id == user["company_id"])
        .order_by(Donation.created_at.desc())
    )
    donations = result.all()

    return [
        {
            "id": d.Donation.id,
            "display_id": f"DON-{d.Donation.id}",
            "item_name": d.Donation.item_name,
            "quantity": d.Donation.quantity,
            "purpose": d.Donation.purpose,
            "status": d.Donation.status,
            "created_at": d.Donation.created_at,
            "ngo_name": d.ngo_name or "Pending Assignment"
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


@router.get(
    "/ngos/verified",
    summary="List verified NGOs for donation selection"
)
async def list_verified_ngos(
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a list of all verified NGOs. 
    Accessible by CSR users during donation creation.
    """
    result = await db.execute(
        select(NGO).where(NGO.is_verified == True)
    )
    ngos = result.scalars().all()
    return [
        {
            "id": n.id,
            "name": n.ngo_name,
            "email": n.official_email
        }
        for n in ngos
    ]


@router.get(
    "/{donation_id}",
    summary="Get single donation details"
)
async def get_donation_details(
    donation_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_role("CSR"))
):
    result = await db.execute(
        select(Donation, NGO.ngo_name)
        .outerjoin(NGO, Donation.ngo_id == NGO.id)
        .where(
            Donation.id == donation_id,
            Donation.company_id == user["company_id"]
        )
    )
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Donation not found")
        
    donation = row.Donation
    return {
        "id": donation.id,
        "display_id": f"DON-{donation.id}",
        "item_name": donation.item_name,
        "quantity": donation.quantity,
        "purpose": donation.purpose,
        "status": donation.status,
        "created_at": donation.created_at,
        "board_resolution_ref": donation.board_resolution_ref,
        "expiry_date": donation.expiry_date,
        "ngo_name": row.ngo_name or "Pending Assignment"
    }
