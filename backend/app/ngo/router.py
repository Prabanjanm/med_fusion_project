from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.deps import get_db
from app.ngo.schema import AllocateDonationRequest, NGORegister, ClinicCreate
from app.ngo.service import accept_csr_donation, register_and_verify_ngo
from app.core.security import require_role
from app.ngo.service import check_ngo_acceptance_eligibility
from app.ngo.accept_service import accept_donation_safely
from app.ngo.service import register_clinic
from app.models.clinic_requirment import ClinicRequirement
from app.models.ngo import NGO
from app.core.security import require_role
from app.ngo.schema import ClinicNeedCreate
from app.ngo.service import create_clinic_need , get_current_ngo, get_available_donations , get_accepted_donations, get_clinic_requirements, allocate_donation
from app.db.deps import get_db
from app.models.donation import Donation
from app.models.donation_allocation import DonationAllocation
from app.ngo.schema import AllocationCreate
from app.models.clinic_requirments import ClinicRequirements
from app.models.donation_allocations import DonationAllocations
from app.models.clinic_uploads import ClinicUpload
from app.services.storage_service import get_signed_file_url
from med_fusion_project.backend.app.blockchain.audit_chain import write_to_blockchain

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
            "ngo_uid": ngo["ngo_uid"]
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
# @router.post("/donations/{donation_id}/accept")
# async def accept_donation(
#     donation_id: int,
#     user=Depends(require_role("NGO")),
#     db=Depends(get_db)
# ):
#     """
#     Accept a CSR donation after passing all safety checks.
#     """
#     return await accept_donation_safely(
#         db=db,
#         donation_id=donation_id,
#         ngo_id=user["ngo_id"]
#     )

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
    
    return await register_clinic(db, ngo_obj, data.official_email, data.clinic_name,data.facility_id, data.facility_id_type, data.doctor_registration_number, data.pincode)



@router.post("/clinic-needs")
async def create_need(
    data: ClinicNeedCreate,
    db=Depends(get_db),
    ngo=Depends(get_current_ngo),
    _: dict = Depends(require_role("NGO"))
):
    """
    NGO records a clinic requirement after physical audit.
    Clinic must be onboarded before allocation.
    """
    return await create_clinic_need(db, ngo, data)

@router.post("/donations/{donation_id}/accept")
async def accept_donation_endpoint(
    donation_id: int,
    db = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await accept_csr_donation(db, ngo, donation_id)


@router.get("/donations/available")
async def list_available_donations(
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await get_available_donations(db)

@router.get("/dashboard/data")
async def ngo_dashboard_data(
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return {
        "accepted_donations": await get_accepted_donations(db, ngo),
        "clinic_requirements": await get_clinic_requirements(db, ngo),
    }

@router.post("/donations/allocate")
async def allocate_donation_endpoint(
    payload: AllocationCreate,
    db: AsyncSession = Depends(get_db),
    ngo = Depends(require_role("NGO"))
):
    return await allocate_donation(
        db,
        ngo,
        payload.donation_id,
        payload.clinic_requirement_id

    )

@router.post("/donations/allocate")
async def allocate_donation(
    data: AllocateDonationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    NGO allocates donation against clinic requirements
    """

    for item in data.allocations:
        result = await db.execute(
            select(ClinicRequirements).where(
                ClinicRequirements.id == item.clinic_requirement_id,
                ClinicRequirements.status == "CONFIRMED",
            )
        )
        req = result.scalar_one_or_none()
        if not req:
            continue

        # allocate
        req.confirmed_quantity -= item.allocate_quantity

        # mark allocated if fulfilled
        if req.confirmed_quantity <= 0:
            req.status = "ALLOCATED"

        allocation = DonationAllocations(
            donation_id=data.donation_id,
            clinic_requirement_id=req.id,
            allocated_quantity=item.allocate_quantity,
        )
        db.add(allocation)
    audit = write_to_blockchain(
    action="NGO_ALLOCATION",
    payload={
        "donation_id": data.donation_id,
        "allocations": data.allocations,
    }
)

    allocation.blockchain_tx = audit["tx_hash"]
    allocation.blockchain_hash = audit["record_hash"]

    await db.commit()

    return {
        "message": "Donation allocated successfully",
        "status": "ALLOCATION_COMPLETED",
    }


@router.get("/requirements/confirmed")
async def ngo_view_confirmed_requirements(
    db: AsyncSession = Depends(get_db),
):
    """
    NGO sees CONFIRMED clinic requirements with proof image URLs
    """

    result = await db.execute(
        select(
            ClinicRequirements,
            ClinicUpload.bucket_name,
            ClinicUpload.file_path,
        ).join(
            ClinicUpload,
            ClinicUpload.id == ClinicRequirements.source_upload_id,
            isouter=True,  # in case upload is missing
        ).where(
            ClinicRequirements.status == "CONFIRMED"
        )
    )

    rows = result.all()

    grouped = defaultdict(lambda: {
        "asset_name": None,
        "priority": "NORMAL",
        "total_quantity": 0,
        "clinics": [],
    })

    for req, bucket, path in rows:
        key = req.asset_name.lower()

        proof_url = None
        if bucket and path:
            proof_url = get_signed_file_url(bucket, path)

        grouped[key]["asset_name"] = req.asset_name
        grouped[key]["priority"] = req.priority
        grouped[key]["total_quantity"] += req.confirmed_quantity or 0

        grouped[key]["clinics"].append({
            "clinic_id": req.clinic_id,
            "requirement_id": req.id,
            "required_quantity": req.confirmed_quantity,
            "proof_url": proof_url,
        })

    return {
        "message": "Confirmed clinic requirements with proof",
        "requirements": list(grouped.values()),
    }


@router.get("/dashboard")
async def ngo_dashboard(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ClinicRequirements)
    )
    rows = result.scalars().all()

    confirmed = len([r for r in rows if r.status == "CONFIRMED"])
    allocated = len([r for r in rows if r.status == "ALLOCATED"])
    emergency = len([r for r in rows if r.priority == "EMERGENCY"])

    return {
        "kpis": {
            "confirmed_needs": confirmed,
            "allocated_needs": allocated,
            "emergency_cases": emergency,
            "pending_allocations": confirmed - allocated,
        }
    }
