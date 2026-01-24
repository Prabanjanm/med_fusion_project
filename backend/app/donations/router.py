from fastapi import APIRouter, Depends
from app.donations.schema import DonationCreate, DonationResponse
from app.donations.controller import create_donation, get_all_donations
from app.core.security import require_role

router = APIRouter(
    prefix="/donations",
    tags=["Donations"]
)

@router.post(
    "/",
    response_model=DonationResponse
)
def donate(
    data: DonationCreate,
    _: dict = Depends(require_role("CSR"))
):
    return create_donation(data)


@router.get("/")
def list_donations(
    _: dict = Depends(require_role("CSR"))
):
    return get_all_donations()
