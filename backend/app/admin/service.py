from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.ngo import NGO
from app.models.donation import Donation
from app.models.admin_audit_log import AdminAuditLog


async def get_pending_companies(db: AsyncSession):
    result = await db.execute(
        select(Company).where(Company.is_verified == False)
    )
    return result.scalars().all()


async def get_pending_ngos(db: AsyncSession):
    result = await db.execute(
        select(NGO).where(NGO.is_verified == False)
    )
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
    result = await db.execute(
        select(NGO).where(NGO.id == ngo_id)
    )
    ngo = result.scalar_one_or_none()

    if not ngo:
        raise ValueError("NGO not found")

    if ngo.is_verified:
        raise ValueError("NGO already verified")

    if approve:
        ngo.is_verified = True
        action = "VERIFY_NGO"
    else:
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

async def get_donation_logs(db: AsyncSession):
    result = await db.execute(
        select(Donation).order_by(Donation.authorized_at.desc())
    )
    return result.scalars().all()
