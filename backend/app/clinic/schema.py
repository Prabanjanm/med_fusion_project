from ast import List
from realtime import List
from pydantic import BaseModel



class SetPasswordRequest(BaseModel):
    token: str
    password: str

class ConfirmReceiptResponse(BaseModel):
    message: str

from datetime import datetime
from pydantic import BaseModel


class ClinicAllocationHistory(BaseModel):
    allocation_id: int
    item_name: str
    quantity: int
    purpose: str

    ngo_name: str

    allocated_at: datetime
    received: bool
    received_at: datetime | None

    class Config:
        from_attributes = True


class ConfirmItem(BaseModel):
    requirement_id: list[int]
    final_quantity: int


class ConfirmRequirementsRequest(BaseModel):
    clinic_id: int
    confirmed_items: List[ConfirmItem]



class ConfirmDonationRequest(BaseModel):
    donation_id: int
