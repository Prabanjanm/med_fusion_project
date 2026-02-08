
from select import select
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db
from app.admin.schema import (
    AdminReviewRequest,
    AdminDonationLogResponse,
    PendingCompanyResponse,
    PendingNGOResponse,
    CompanyResponse,
    NGOResponse
)


from app.admin.service import (
    review_company,
    review_ngo,
    get_donation_logs,
    get_pending_companies,
    get_pending_ngos,
    get_verified_companies,
    get_verified_ngos
)
from app.models.clinic_requirments import ClinicRequirements

router = APIRouter(prefix="/admin", tags=["Admin"])


# TEMP admin user until auth is wired
class TempAdminUser:
    id = 1


@router.post("/company/{company_uid}/review")
async def review_company_endpoint(
    company_uid: str,
    data: AdminReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        admin_user = TempAdminUser()
        return await review_company(
            db=db,
            company_uid=company_uid,
            admin_user=admin_user,
            approve=data.approve,
            remarks=data.remarks,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ngo/{ngo_uid}/review")
async def review_ngo_endpoint(
    ngo_uid: str,
    data: AdminReviewRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        admin_user = TempAdminUser()
        return await review_ngo(
            db=db,
            ngo_uid=ngo_uid,
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
    print("Fetching donation logs")
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



@router.get(
    "/admin/companies/verified",
    response_model=list[CompanyResponse]
)
async def fetch_verified_companies(
    db: AsyncSession = Depends(get_db)
):
    return await get_verified_companies(db)


@router.get(
    "/admin/ngos/verified",
    response_model=list[NGOResponse]
)
async def fetch_verified_ngos(
    db: AsyncSession = Depends(get_db)
):
    return await get_verified_ngos(db)

from sqlalchemy import select, func

@router.get("/dashboard")
async def admin_dashboard(db: AsyncSession = Depends(get_db)):

    total_requirements = await db.scalar(
        select(func.count()).select_from(ClinicRequirements)
    )

    confirmed = await db.scalar(
        select(func.count())
        .select_from(ClinicRequirements)
        .where(ClinicRequirements.status == "CONFIRMED")
    )

    allocated = await db.scalar(
        select(func.count())
        .select_from(ClinicRequirements)
        .where(ClinicRequirements.status == "ALLOCATED")
    )

    return {
        "kpis": {
            "total_requirements": total_requirements or 0,
            "confirmed": confirmed or 0,
            "allocated": allocated or 0,
        }
    }



# @router.get("/blockchain/audit")
# async def admin_blockchain_audit():
#     logs = []
#     total = contract.functions.totalLogs().call()

#     for i in range(total):
#         action, record_hash, timestamp = contract.functions.getLog(i).call()
#         logs.append({
#             "index": i,
#             "action": action,
#             "record_hash": record_hash,
#             "timestamp": timestamp,
#         })

#     return {
#         "total_logs": total,
#         "logs": logs,
#         "network": "Ethereum (Ganache)",
#     }
