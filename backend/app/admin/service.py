from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.admin_audit_log import AdminAuditLog
from collections import defaultdict
from app.models.donation_allocation import DonationAllocation

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


from sqlalchemy import case, func
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
        )
        .outerjoin(
            DonationAllocation,
            DonationAllocation.donation_id == Donation.id
        )
        .order_by(
            func.coalesce(
                DonationAllocation.allocated_at,
                Donation.authorized_at
            ).desc()
        )
        .limit(10)
    )

    return result.mappings().all()



async def get_verified_companies(db: AsyncSession):
    result = await db.execute(
        select(Company)
        .where(Company.is_verified.is_(True))
        .order_by(Company.id.desc())
    )
    return result.scalars().all()


async def get_verified_ngos(db: AsyncSession):
    result = await db.execute(
        select(NGO)
        .where(NGO.is_verified.is_(True))
        .order_by(NGO.id.desc())
    )
    return result.scalars().all()


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

            DonationAllocation.clinic_requirement_id,
            DonationAllocation.allocated_at,
            DonationAllocation.received,
            DonationAllocation.received_at,
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
                    "clinic_requirement_id": row["clinic_requirement_id"],
                    "allocated_at": row["allocated_at"],
                    "received": row["received"],
                    "received_at": row["received_at"],
                } if row["clinic_requirement_id"] is not None else None
            })

    return ngo