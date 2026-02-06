from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AdminReviewRequest(BaseModel):
    approve: bool  # True = VERIFY, False = REJECT
    remarks: Optional[str] = None
class PendingCompanyResponse(BaseModel):
    id: int
    company_name: str
    cin: str
    pan: str
    is_verified: Optional[bool] = None 


    class Config:
        from_attributes = True


class PendingNGOResponse(BaseModel):
    id: int
    ngo_name: str
    csr_1_number: str
    official_email: str
    is_verified: Optional[bool] = None 
    class Config:
        from_attributes = True


class AdminReviewResponse(BaseModel):
    entity_id: int
    approved: bool
    message: str


class AdminDonationLogResponse(BaseModel):
    id: int
    company_id: int
    ngo_id:  Optional[int] = None 
    item_name: str
    quantity: int
    purpose: str
    status: str
    authorized_at: datetime

    class Config:
        from_attributes = True

class CompanyResponse(BaseModel):
    id: int
    company_name: str
    cin: Optional[str] = None
    official_email: Optional[str] = None
    is_verified: Optional[bool] = None
    total_donations: Optional[int] = 0

    class Config:
        from_attributes = True

class NGOResponse(BaseModel):
    id: int
    ngo_name: str
    csr_1_number: Optional[str] = None
    official_email: Optional[str] = None
    is_verified: Optional[bool] = None
    pending_donations: Optional[int] = 0
    allocations_made: Optional[int] = 0

    class Config:
        from_attributes = True

class ClinicResponse(BaseModel):
    id: int
    clinic_name: str
    address: Optional[str] = None
    official_email: Optional[str] = None
    is_active: bool
    total_requirements: int = 0
    confirmed_receipts: int = 0

    class Config:
        from_attributes = True

class ClinicAllocationPart(BaseModel):
    id: Optional[int] = None
    received: Optional[bool] = None
    received_at: Optional[datetime] = None
    feedback: Optional[str] = None
    quality_rating: Optional[int] = None

class ClinicRequirementPart(BaseModel):
    id: int
    item_name: str
    quantity: int
    urgency: str
    created_at: datetime
    allocation: Optional[ClinicAllocationPart] = None

class ClinicActivityResponse(BaseModel):
    id: int
    clinic_name: str
    address: Optional[str] = None
    is_active: bool
    requirements: list[ClinicRequirementPart] = []

    class Config:
        from_attributes = True