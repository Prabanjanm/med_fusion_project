from pydantic import BaseModel



class SetPasswordRequest(BaseModel):
    token: str
    password: str

class ConfirmReceiptRequest(BaseModel):
    feedback: str | None = None
    quality_rating: int | None = 5 # Default 5 stars

class ConfirmReceiptResponse(BaseModel):
    message: str

from datetime import datetime
from pydantic import BaseModel


class ClinicAllocationHistory(BaseModel):
    allocation_id: int
    donation_id: int
    item_name: str
    quantity: int
    purpose: str
    status: str

    ngo_name: str

    allocated_at: datetime
    received: bool
    received_at: datetime | None

    class Config:
        from_attributes = True

class RequirementCreate(BaseModel):
    item_name: str
    quantity: int
    purpose: str
    priority: int = 3 # 1-Critical, 4-Low
