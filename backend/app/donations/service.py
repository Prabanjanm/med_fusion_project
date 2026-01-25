from sqlalchemy.ext.asyncio import AsyncSession
from app.models.donation import Donation


async def create_donation(db: AsyncSession, data, company_id: int):
    """
    Create CSR donation record.
    """
    donation = Donation(
        item_name=data.item_name,
        quantity=data.quantity,
        company_id=company_id
    )
    db.add(donation)
    await db.commit()
    await db.refresh(donation)
    return donation
