from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.deps import get_db
from app.admin.schema import (
    AdminReviewRequest,
    AdminDonationLogResponse,
    PendingCompanyResponse,
    PendingNGOResponse,
    CompanyResponse,
    NGOResponse,
    ClinicResponse,
    ClinicActivityResponse
)


from app.admin.service import (
    review_company,
    review_ngo,
    get_donation_logs,
    get_pending_companies,
    get_pending_ngos,
    get_verified_companies,
    get_verified_ngos,
    get_verified_clinics,
    get_clinic_with_requirements,
    get_system_stats
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
    print("Fetching donation logs")
    return await get_donation_logs(db)


from app.blockchain.service import get_audit_trail

@router.get("/audit-trail")
async def fetch_audit_trail(db: AsyncSession = Depends(get_db)):
    """
    Returns the unified blockchain audit trail with database fallback.
    """
    try:
        blockchain_trail = await get_audit_trail()
        if blockchain_trail:
            return blockchain_trail
            
        # Fallback to DB logs if blockchain is empty/offline
        # Fallback to DB logs if blockchain is empty/offline
        logs = await get_donation_logs(db)
        fallback = []
        for log in logs:
            base_ref = f"DON-{log['id']}"
            
            # 1. Base CSR Creation Event (Always exists for a valid donation)
            fallback.append({
                "timestamp": log["authorized_at"].isoformat() if log["authorized_at"] else datetime.now().isoformat(),
                "role": "CSR",
                "entity_name": log["company_name"] or "CSR Partner",
                "action": "DONATION_CREATED",
                "reference_id": base_ref,
                "tx_hash": f"0xDB_CSR_{log['id']}_GENESIS",
                "clinic_name": log["clinic_name"],
                "ngo_name": log["ngo_name"],
                "company_name": log["company_name"],
                "item_name": log["item_name"],
                "quantity": log["quantity"],
                "purpose": log["purpose"]
            })

            # 2. NGO Allocation Event
            if log["allocated_at"] or log["clinic_requirement_id"]:
                 fallback.append({
                    "timestamp": log["allocated_at"].isoformat() if log["allocated_at"] else datetime.now().isoformat(),
                    "role": "NGO",
                    "entity_name": log["ngo_name"] or "NGO Partner",
                    "action": "ALLOCATION_PROCESSED",
                    "reference_id": f"{base_ref}-ALLOC",
                    "tx_hash": f"0xDB_NGO_{log['id']}_ALLOC",
                    "clinic_name": log["clinic_name"],
                    "ngo_name": log["ngo_name"],
                    "company_name": log["company_name"],
                    "item_name": log["item_name"],
                    "quantity": log["quantity"]
                 })

            # 3. Clinic Receipt Event
            if log["received"]:
                 fallback.append({
                    "timestamp": log["received_at"].isoformat() if log["received_at"] else datetime.now().isoformat(),
                    "role": "CLINIC",
                    "entity_name": log["clinic_name"] or "Clinic",
                    "action": "SUPPLIES_RECEIVED",
                    "reference_id": f"{base_ref}-RECV",
                    "tx_hash": f"0xDB_CLN_{log['id']}_RECV",
                    "clinic_name": log["clinic_name"],
                    "ngo_name": log["ngo_name"],
                    "company_name": log["company_name"],
                    "item_name": log["item_name"],
                    "quantity": log["quantity"]
                 })

        # Sort fallback by timestamp descending to mimic blockchain order
        fallback.sort(key=lambda x: x["timestamp"], reverse=True)
        return fallback

    except Exception as e:
        print(f"Audit Trail Fallback Error: {e}")
        return []


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
    "/companies/verified",
    response_model=list[CompanyResponse]
)
async def fetch_verified_companies(
    db: AsyncSession = Depends(get_db)
):
    return await get_verified_companies(db)


@router.get(
    "/ngos/verified",
    response_model=list[NGOResponse]
)
async def fetch_verified_ngos(
    db: AsyncSession = Depends(get_db)
):
    return await get_verified_ngos(db)

@router.get("/companies/{company_id}/activity")
async def get_company_activity_endpoint(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    from app.admin.service import get_company_with_donations
    return await get_company_with_donations(db, company_id)

@router.get("/ngos/{ngo_id}/activity")
async def get_ngo_activity_endpoint(
    ngo_id: int,
    db: AsyncSession = Depends(get_db)
):
    from app.admin.service import get_ngo_with_donations_and_allocations
    return await get_ngo_with_donations_and_allocations(db, ngo_id)

@router.get(
    "/clinics/verified",
    response_model=list[ClinicResponse]
)
async def fetch_verified_clinics(
    db: AsyncSession = Depends(get_db)
):
    return await get_verified_clinics(db)

@router.get(
    "/clinics/{clinic_id}/activity",
    response_model=ClinicActivityResponse
)
async def get_clinic_activity_endpoint(
    clinic_id: int,
    db: AsyncSession = Depends(get_db)
):
    return await get_clinic_with_requirements(db, clinic_id)

@router.get("/stats")
async def fetch_system_stats(
    db: AsyncSession = Depends(get_db)
):
    return await get_system_stats(db)