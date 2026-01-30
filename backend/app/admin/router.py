from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db
from app.admin.schema import (
    AdminReviewRequest,
    AdminDonationLogResponse,
    PendingCompanyResponse,
    PendingNGOResponse,
)


from app.admin.service import (
    review_company,
    review_ngo,
    get_donation_logs,
    get_pending_companies,
    get_pending_ngos,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


# TEMP admin user until auth is wired
class TempAdminUser:
    id = 1


@router.post("/company/{company_id}/review")
async def review_company_endpoint(
    company_id: int,
    data: AdminReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        admin_user = TempAdminUser()
        return await review_company(
            db=db,
            company_id=company_id,
            admin_user=admin_user,
            approve=data.approve,
            remarks=data.remarks,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ngo/{ngo_id}/review")
async def review_ngo_endpoint(
    ngo_id: int,
    data: AdminReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        admin_user = TempAdminUser()
        return await review_ngo(
            db=db,
            ngo_id=ngo_id,
            admin_user=admin_user,
            approve=data.approve,
            remarks=data.remarks,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get(
    "/donations",
    response_model=list[AdminDonationLogResponse],
)
async def get_donation_logs_endpoint(
    db: AsyncSession = Depends(get_db),
):
    return await get_donation_logs(db)


@router.get(
    "/companies/requests",
    response_model=list[PendingCompanyResponse],
)
async def get_company_requests(
    db: AsyncSession = Depends(get_db),
):
    return await get_pending_companies(db)

@router.get(
    "/ngos/requests",
    response_model=list[PendingNGOResponse],
)
async def get_ngo_requests(
    db: AsyncSession = Depends(get_db),
):
    return await get_pending_ngos(db)
