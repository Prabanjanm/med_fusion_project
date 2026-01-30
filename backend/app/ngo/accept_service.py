from fastapi import HTTPException, status
from sqlalchemy import select
from app.models.donation import Donation
from app.ngo.service import check_ngo_acceptance_eligibility


async def accept_donation_safely(db, donation_id: int, ngo_id: int):
    """
    Accept donation ONLY if eligibility checks pass.
    """

    eligibility = await check_ngo_acceptance_eligibility(
        db, donation_id, ngo_id
    )

    if not eligibility["eligible"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Donation cannot be accepted",
                "reasons": eligibility["reasons"]
            }
        )

    donation_result = await db.execute(
        select(Donation).where(Donation.id == donation_id)
    )
    donation = donation_result.scalar_one()

    donation.ngo_id = ngo_id
    donation.status = "ACCEPTED"

    await db.commit()
    await db.refresh(donation)

    return {
        "message": "Donation accepted successfully",
        "donation_id": donation.id,
        "status": donation.status
    }
