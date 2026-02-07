from datetime import datetime
from sys import audit
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.donation import Donation
from app.donations.schema import DonationCreate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.donation import Donation
from sqlalchemy import func

from app.blockchain.service import log_to_blockchain
from med_fusion_project.backend.app.blockchain.audit_chain import write_to_blockchain



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
        item_name=data.item_name,
        quantity=data.quantity,
        purpose=data.purpose,
        board_resolution_ref=data.board_resolution_ref,
        csr_policy_declared=data.csr_policy_declared,
        status="AUTHORIZED",
        authorized_at=datetime.utcnow()
    )

    db.add(donation)
    
    audit = write_to_blockchain(
        action="CSR_DONATION",
        payload={
            "company_id": donation.company_id,
            "donation_id": donation.id,
            "amount": donation.amount,
        }
    )

    donation.blockchain_tx = audit["tx_hash"]
    donation.blockchain_hash = audit["record_hash"]

    await db.commit()
    await db.refresh(donation)
#     audit= await log_to_blockchain(
#     action="DONATION_CREATED",
#     entity=f"DON-{donation.id}"
# )
    audit = await run_in_threadpool(
        log_to_blockchain,
        "DONATION_CREATED",
        str(donation.id)
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
