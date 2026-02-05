from datetime import datetime, timezone
from sys import audit
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.donation import Donation
from app.models.company import Company # Added Import
from app.donations.schema import DonationCreate
from sqlalchemy import select
from sqlalchemy import func

from app.blockchain.service import log_to_blockchain



async def create_donation(
    db: AsyncSession,
    data: DonationCreate,
    company_id: int
):
    """
    Create a CSR-authorized donation.
    Status is set automatically to AUTHORIZED.
    """

    donation = Donation(
        company_id=company_id,
        ngo_id=data.ngo_id, # Added ngo_id
        item_name=data.item_name,
        quantity=data.quantity,
        purpose=data.purpose,
        board_resolution_ref=data.board_resolution_ref,
        csr_policy_declared=data.csr_policy_declared,
        expiry_date=data.expiry_date,
        status="AUTHORIZED",
        authorized_at=datetime.now(timezone.utc)
    )

    db.add(donation)
    await db.commit()
    await db.refresh(donation)
    # Fetch company name for audit trail
    result = await db.execute(select(Company.company_name).where(Company.id == company_id))
    company_name = result.scalar() or "CSR Company"

    audit = await run_in_threadpool(
        log_to_blockchain,
        action="DONATION_CREATED",
        entity=f"DON-{donation.id}",
        role="CSR",
        donor_name=company_name
    )

    return { "donation": donation, "audit": audit }




async def get_csr_donation_history(
    db: AsyncSession,
    company_id: int
):
    """
    Fetch all donations created by the CSR's company.
    """

    result = await db.execute(
        select(Donation)
        .where(Donation.company_id == company_id)
        .order_by(Donation.created_at.desc())
    )

    return result.scalars().all()




async def get_csr_dashboard_analytics(
    db: AsyncSession,
    company_id: int
):
    """
    Aggregate CSR donation analytics.
    """

    total_donations = await db.scalar(
        select(func.count(Donation.id))
        .where(Donation.company_id == company_id)
    )

    total_quantity = await db.scalar(
        select(func.coalesce(func.sum(Donation.quantity), 0))
        .where(Donation.company_id == company_id)
    )

    status_counts = await db.execute(
        select(Donation.status, func.count(Donation.id))
        .where(Donation.company_id == company_id)
        .group_by(Donation.status)
    )

    return {
        "total_donations": total_donations,
        "total_items_donated": total_quantity,
        "status_breakdown": {
            status: count for status, count in status_counts.all()
        }
    }
