from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.deps import get_db
from app.donations.schema import DonationCreate
from app.donations.service import create_donation
from app.core.security import require_role

router = APIRouter(prefix="/donations", tags=["Donations"])


@router.post("/")
async def create_csr_donation(
    data: DonationCreate,
    payload=Depends(require_role("CSR")),
    db: AsyncSession = Depends(get_db)
):
    """
    CSR can create donation ONLY after:
    - login
    - password set
    - company verified
    """
    return await create_donation(
        db,
        data,
        company_id=payload["company_id"]
    )
