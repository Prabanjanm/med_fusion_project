from datetime import datetime
from sqlalchemy import select, func, distinct, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.admin_audit_log import AdminAuditLog
from app.models.donation_allocation import DonationAllocation
from app.models.clinic import Clinic
from app.models.clinic_requirment import ClinicRequirement
from app.models.user import User
from collections import defaultdict

    # Fetch pending companies (Requests)
async def get_pending_companies(db: AsyncSession):


    # 1. Get Rejected IDs separately
    rejected_logs = await db.execute(
        select(AdminAuditLog.entity_id).where(
            AdminAuditLog.action == "REJECT_COMPANY"
        )
    )
    rejected_ids = rejected_logs.scalars().all()

    # 2. Build Query
    query = select(Company).where(
        (Company.is_verified == None) | (Company.is_verified == False)
    )
    
    if rejected_ids:
        query = query.where(Company.id.not_in(rejected_ids))

    result = await db.execute(query)
    return result.scalars().all()


async def get_pending_ngos(db: AsyncSession):
    rejected_logs = await db.execute(
        select(AdminAuditLog.entity_id).where(
            AdminAuditLog.action == "REJECT_NGO"
        )
    )
    rejected_ids = rejected_logs.scalars().all()

    query = select(NGO).where(
        (NGO.is_verified == None) | (NGO.is_verified == False)
    )

    if rejected_ids:
        query = query.where(NGO.id.not_in(rejected_ids))

    result = await db.execute(query)
    return result.scalars().all()


async def review_company(
    db: AsyncSession,
    company_id: int,
    admin_user,
    approve: bool,
    remarks: str | None = None,
):
    result = await db.execute(
        select(Company).where(Company.id == company_id)
    )
    company = result.scalar_one_or_none()

    if not company:
        raise ValueError("Company not found")

    if company.is_verified:
        raise ValueError("Company already verified")

    if approve:
        company.is_verified = True
        action = "VERIFY_COMPANY"
    else:
        company.is_verified = False
        action = "REJECT_COMPANY"

    db.add(
        AdminAuditLog(
            admin_id=admin_user.id,
            action=action,
            entity_type="COMPANY",
            entity_id=company.id,
            remarks=remarks,
        )
    )

    await db.commit()
    await db.refresh(company)

    return {
        "company_id": company.id,
        "approved": approve,
    }


async def review_ngo(
    db: AsyncSession,
    ngo_id: int,
    admin_user,
    approve: bool,
    remarks: str | None = None,
): 
    print("Reviewing NGO with ID:", ngo_id)
    result = await db.execute(
        select(NGO).where(NGO.id == ngo_id)
    )
    ngo = result.scalar_one_or_none()
    print("Fetched NGO:", ngo)

    if not ngo:
        raise ValueError("NGO not found")

    if ngo.is_verified:
        raise ValueError("NGO already verified")

    if approve:
        print("Approving NGO")
        ngo.is_verified = True
        action = "VERIFY_NGO"
    else:
        print("Rejecting NGO")
        ngo.is_verified = False
        action = "REJECT_NGO"

    db.add(
        AdminAuditLog(
            admin_id=admin_user.id,
            action=action,
            entity_type="NGO",
            entity_id=ngo.id,
            remarks=remarks,
        )
    )

    await db.commit()
    await db.refresh(ngo)

    return {
        "ngo_id": ngo.id,
        "approved": approve,
    }


from sqlalchemy import case, func, distinct
async def get_donation_logs(db: AsyncSession):
    result = await db.execute(
        select(
            # Donation fields (same as your current response)
            Donation.id,
            Donation.company_id,
            Donation.ngo_id,
            Donation.item_name,
            Donation.quantity,
            Donation.purpose,
            Donation.authorized_at,

            # ✅ Clinic allocation field (THIS IS WHAT YOU WANT)
            DonationAllocation.clinic_requirement_id,

            # Optional allocation metadata
            DonationAllocation.allocated_at,
            DonationAllocation.received,
            DonationAllocation.received_at,

            # ✅ FINAL DERIVED STATUS (business-correct)
            case(
                (
                    DonationAllocation.received.is_(True),
                    "CLINIC_ACCEPTED"
                ),
                (
                    DonationAllocation.donation_id.isnot(None),
                    "NGO_ACCEPTED"
                ),
                else_="AUTHORIZED"
            ).label("status"),
            
            # ✅ Clinic Name for filtering
            Clinic.clinic_name,
            
            # ✅ Company Name for Entity ID
            Company.company_name,

            # ✅ NGO Name for Entity ID
            NGO.ngo_name
        )
        .outerjoin(
            Company,
            Company.id == Donation.company_id
        )
        .outerjoin(
            NGO,
            NGO.id == Donation.ngo_id
        )
        .outerjoin(
            DonationAllocation,
            DonationAllocation.donation_id == Donation.id
        )
        .outerjoin(
            ClinicRequirement, 
            DonationAllocation.clinic_requirement_id == ClinicRequirement.id
        )
        .outerjoin(
            Clinic, 
            ClinicRequirement.clinic_id == Clinic.id
        )
        .order_by(
            func.coalesce(
                DonationAllocation.allocated_at,
                Donation.authorized_at
            ).desc()
        )
        .limit(50)  # Increased limit for better audit visibility
    )

    return result.mappings().all()



async def get_verified_companies(db: AsyncSession):
    # Join with User for email and Donation for count
    # Company model does NOT have official_email, it's in User
    result = await db.execute(
        select(
            Company.id,
            Company.company_name,
            Company.cin,
            User.email.label("official_email"),
            Company.is_verified,
            func.count(distinct(Donation.id)).label("total_donations")
        )
        .outerjoin(User, User.company_id == Company.id)
        .outerjoin(Donation, Donation.company_id == Company.id)
        .where(Company.is_verified.is_(True))
        .group_by(Company.id, User.email)
        .order_by(Company.id.desc())
    )
    return result.mappings().all()


async def get_verified_clinics(db: AsyncSession):
    # Join with User for email and ClinicRequirement for count
    result = await db.execute(
        select(
            Clinic.id,
            Clinic.clinic_name,
            Clinic.address,
            Clinic.pincode,
            Clinic.official_email,
            Clinic.is_active,
            func.count(distinct(ClinicRequirement.id)).label("total_requirements"),
            func.count(distinct(case((DonationAllocation.received == True, DonationAllocation.id), else_=None))).label("confirmed_receipts"),
            # Calculate Active Needs properly (Not Fully Allocated)
            func.count(distinct(case((ClinicRequirement.status != 'ALLOCATED', ClinicRequirement.id), else_=None))).label("active_needs")
        )
        .outerjoin(ClinicRequirement, ClinicRequirement.clinic_id == Clinic.id)
        .outerjoin(DonationAllocation, DonationAllocation.clinic_requirement_id == ClinicRequirement.id)
        .where(Clinic.is_active.is_(True))
        .group_by(Clinic.id)
        .order_by(Clinic.id.desc())
    )
    return result.mappings().all()


async def get_verified_ngos(db: AsyncSession):
    # NGO has official_email in its model
    result = await db.execute(
        select(
            NGO.id,
            NGO.ngo_name,
            NGO.csr_1_number,
            NGO.official_email,
            NGO.is_verified,
            func.count(distinct(Donation.id)).label("pending_donations"),
            func.count(distinct(DonationAllocation.id)).label("allocations_made")
        )
        .outerjoin(Donation, Donation.ngo_id == NGO.id)
        .outerjoin(DonationAllocation, DonationAllocation.donation_id == Donation.id)
        .where(NGO.is_verified.is_(True))
        .group_by(NGO.id)
        .order_by(NGO.id.desc())
    )
    return result.mappings().all()


async def get_company_with_donations(
    db: AsyncSession,
    company_id: int
):
    result = await db.execute(
        select(
            Company.id,
            Company.company_name,
            Company.cin,
            Company.pan,
            Company.is_verified,

            Donation.id.label("donation_id"),
            Donation.item_name,
            Donation.quantity,
            Donation.purpose,
            Donation.board_resolution_ref,
            Donation.csr_policy_declared,
            Donation.status,
            Donation.authorized_at,
            Donation.created_at,
            Donation.ngo_id,
        )
        .join(Donation, Donation.company_id == Company.id, isouter=True)
        .where(Company.id == company_id)   # 👈 FILTER HERE
        .order_by(Donation.created_at.desc().nullslast())
    )

    rows = result.mappings().all()

    if not rows:
        return None   # or raise HTTPException(404)

    company = {
        "id": rows[0]["id"],
        "company_name": rows[0]["company_name"],
        "cin": rows[0]["cin"],
        "pan": rows[0]["pan"],
        "is_verified": rows[0]["is_verified"],
        "donations": []
    }

    for row in rows:
        if row["donation_id"] is not None:
            company["donations"].append({
                "id": row["donation_id"],
                "item_name": row["item_name"],
                "quantity": row["quantity"],
                "purpose": row["purpose"],
                "board_resolution_ref": row["board_resolution_ref"],
                "csr_policy_declared": row["csr_policy_declared"],
                "status": row["status"],
                "authorized_at": row["authorized_at"],
                "created_at": row["created_at"],
                "ngo_id": row["ngo_id"],
            })

    return company


async def get_ngo_with_donations_and_allocations(
    db: AsyncSession,
    ngo_id: int
):
    result = await db.execute(
        select(
            NGO.id,
            NGO.ngo_name,
            NGO.is_verified,

            Donation.id.label("donation_id"),
            Donation.item_name,
            Donation.quantity,
            Donation.purpose,
            Donation.board_resolution_ref,
            Donation.csr_policy_declared,
            Donation.status,
            Donation.authorized_at,
            Donation.created_at,

            DonationAllocation.id.label("allocation_id"),
            DonationAllocation.clinic_requirement_id,
            DonationAllocation.allocated_at,
            DonationAllocation.received,
            DonationAllocation.received_at,
            DonationAllocation.feedback,
            DonationAllocation.quality_rating,
        )
        .join(Donation, Donation.ngo_id == NGO.id, isouter=True)
        .join(
            DonationAllocation,
            DonationAllocation.donation_id == Donation.id,
            isouter=True
        )
        .where(NGO.id == ngo_id)
        .order_by(Donation.created_at.desc().nullslast())
    )

    rows = result.mappings().all()

    if not rows:
        return None

    ngo = {
        "id": rows[0]["id"],
        "ngo_name": rows[0]["ngo_name"],
        "is_verified": rows[0]["is_verified"],
        "donations": []
    }

    for row in rows:
        if row["donation_id"] is not None:
            ngo["donations"].append({
                "id": row["donation_id"],
                "item_name": row["item_name"],
                "quantity": row["quantity"],
                "purpose": row["purpose"],
                "board_resolution_ref": row["board_resolution_ref"],
                "csr_policy_declared": row["csr_policy_declared"],
                "status": row["status"],
                "authorized_at": row["authorized_at"],
                "created_at": row["created_at"],
                "allocation": {
                    "id": row["allocation_id"],
                    "received": row["received"],
                    "received_at": row["received_at"],
                    "feedback": row["feedback"],
                    "quality_rating": row["quality_rating"]
                } if row["allocation_id"] else None
            })

    return ngo


async def get_clinic_with_requirements(
    db: AsyncSession,
    clinic_id: int
):
    result = await db.execute(
        select(
            Clinic.id,
            Clinic.clinic_name,
            Clinic.is_active,
            Clinic.address,
            Clinic.official_email,
            Clinic.pincode,

            ClinicRequirement.id.label("requirement_id"),
            ClinicRequirement.item_name,
            ClinicRequirement.quantity,
            ClinicRequirement.priority,
            ClinicRequirement.created_at,

            DonationAllocation.id.label("allocation_id"),
            DonationAllocation.received,
            DonationAllocation.received_at,
            DonationAllocation.feedback.label("alloc_feedback"),
            DonationAllocation.quality_rating.label("alloc_rating"),

            NGO.ngo_name,
            Company.company_name
        )
        .join(ClinicRequirement, ClinicRequirement.clinic_id == Clinic.id, isouter=True)
        .join(DonationAllocation, DonationAllocation.clinic_requirement_id == ClinicRequirement.id, isouter=True)
        .join(Donation, DonationAllocation.donation_id == Donation.id, isouter=True)
        .join(NGO, Donation.ngo_id == NGO.id, isouter=True)
        .join(Company, Donation.company_id == Company.id, isouter=True)
        .where(Clinic.id == clinic_id)
        .order_by(ClinicRequirement.created_at.desc())
    )

    rows = result.mappings().all()
    if not rows:
        return None

    clinic = {
        "id": rows[0]["id"],
        "clinic_name": rows[0]["clinic_name"],
        "address": rows[0]["address"],
        "official_email": rows[0]["official_email"],
        "pincode": rows[0]["pincode"],
        "is_active": rows[0]["is_active"],
        "requirements": []
    }

    for row in rows:
        if row["requirement_id"] is not None:
            # Map priority int to urgency label
            priority_map = {1: "CRITICAL", 2: "HIGH", 3: "NORMAL", 4: "LOW"}
            urgency = priority_map.get(row["priority"], "NORMAL")

            clinic["requirements"].append({
                "id": row["requirement_id"],
                "item_name": row["item_name"],
                "quantity": row["quantity"],
                "urgency": urgency,
                "created_at": row["created_at"],
                "allocation": {
                    "id": row["allocation_id"],
                    "received": row["received"],
                    "received_at": row["received_at"],
                    "feedback": row["alloc_feedback"],
                    "quality_rating": row["alloc_rating"],
                    "ngo_name": row["ngo_name"],
                    "company_name": row["company_name"]
                } if row["allocation_id"] else None
            })

    return clinic

async def get_system_stats(db: AsyncSession):
    """
    Calculate global aggregated stats for the dashboard.
    Requirements: Aggregated donation totals, item counts.
    """
    # 1. Total items donated (sum of all quantities)
    total_qty_result = await db.execute(select(func.sum(Donation.quantity)))
    total_qty = total_qty_result.scalar() or 0

    # 2. Aggregated items (e.g. Total PPE Kits: 50, Total Masks: 100)
    items_result = await db.execute(
        select(Donation.item_name, func.sum(Donation.quantity))
        .group_by(Donation.item_name)
    )
    aggregated_items = [
        {"item": row[0], "total": row[1]} for row in items_result.all()
    ]

    # 3. Fulfillment Rate
    alloc_result = await db.execute(
        select(
            func.count(DonationAllocation.id),
            func.sum(case((DonationAllocation.received == True, 1), else_=0))
        )
    )
    res = alloc_result.first()
    total_alloc = res[0] or 0
    total_received = res[1] or 0
    rate = (total_received / total_alloc * 100) if total_alloc > 0 else 0

    return {
        "total_donated_items": total_qty,
        "aggregated_items": aggregated_items,
        "fulfillment_rate": round(rate, 1)
    }