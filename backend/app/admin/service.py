from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.admin_audit_log import AdminAuditLog
from collections import defaultdict
from app.models.donation_allocation import DonationAllocation
from app.auth.invitation_token import create_invite_token
from app.notifications.email_service import send_csr_password_setup_email, send_ngo_password_setup_email
from app.core.config import settings
from app.models.user import User    

async def get_pending_companies(db: AsyncSession):
    result = await db.execute(
        select(Company).where(Company.is_verified.is_(False))
    )
    return result.scalars().all()


async def get_pending_ngos(db: AsyncSession):
    result = await db.execute(
        select(NGO).where(NGO.is_verified.is_(False))
    )
    return result.scalars().all()


async def review_company(
    db: AsyncSession,
    company_uid: str,
    admin_user,
    approve: bool,
    remarks: str | None = None,
):
    select(Company).where(Company.csr_uid == company_uid)
    company = await db.execute(
        select(Company).where(Company.csr_uid == company_uid)
    )
    company = company.scalar_one_or_none()
    if not company:
        raise ValueError("Company not found")

    if company.is_verified is True:
        raise ValueError("Company already verified")
    
    
    if approve:
        company.is_verified = True
        action = "VERIFY_COMPANY"

        token = create_invite_token(
            role="CSR",
            email=str(company.official_email),
            csr_uid=company.csr_uid
        )
        print("Generated token for CSR password setup:", token)

        invite_link = (
            f"{settings.FRONTEND_URL}/static/set-csr-password.html"
            f"?token={token}"
        )

        await send_csr_password_setup_email(
            to_email=company.official_email,
            company_name=company.company_name,
            csr_uid=company.csr_uid,
            invite_link=invite_link,
        )
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

    return {
        "csr_uid": company.csr_uid,
        "approved": approve,
    }


async def review_ngo(
    db: AsyncSession,
    ngo_uid: str,
    admin_user,
    approve: bool,
    remarks: str | None = None,
):
    # 1️⃣ Fetch NGO using ngo_uid
    result = await db.execute(
        select(NGO).where(NGO.ngo_uid == ngo_uid)
    )
    ngo = result.scalar_one_or_none()

    if not ngo:
        raise ValueError("NGO not found")

    if ngo.is_verified is True:
        raise ValueError("NGO already verified")

    # 2️⃣ Approve or Reject
    if approve:
        ngo.is_verified = True
        action = "VERIFY_NGO"

        # 3️⃣ Create invite token
        token = create_invite_token(
            role="NGO",
            email=str(ngo.official_email),
            ngo_uid=ngo.ngo_uid,
        )
        print("Generated token for NGO password setup:", token)

        invite_link = (
            f"{settings.FRONTEND_URL}/static/set-ngo-password.html"
            f"?token={token}"
        )

        # 4️⃣ Send email
        await send_ngo_password_setup_email(
            to_email=ngo.official_email,
            ngo_name=ngo.ngo_name,
            ngo_uid=ngo.ngo_uid,
            invite_link=invite_link,
        )

    else:
        ngo.is_verified = False
        action = "REJECT_NGO"

    # 5️⃣ Audit log
    db.add(
        AdminAuditLog(
            admin_id=admin_user.id,
            action=action,
            entity_type="NGO",
            entity_id=ngo.id,
            remarks=remarks,
        )
    )

    # 6️⃣ Save
    await db.commit()

    return {
        "ngo_uid": ngo.ngo_uid,
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