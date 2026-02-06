from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DonationCreate(BaseModel):
    """
    Data required from CSR to authorize a donation.
    """

    item_name: str = Field(..., example="Medical Kits")
    quantity: int = Field(..., gt=0, example=100)

    purpose: str = Field(
        ...,
        example="Rural healthcare support for primary clinics"
    )

    board_resolution_ref: str = Field(
        ...,
        example="BR-CSR-2026-007",
        description="Reference ID of the board resolution approving this donation"
    )

    csr_policy_declared: bool = Field(
        ...,
        example=True,
        description="Confirms donation aligns with declared CSR policy"
    )
    
    expiry_date: datetime = Field(
        ...,
        example="2026-12-31T00:00:00Z"
    )

    ngo_id: Optional[int] = Field(None, example=1)
