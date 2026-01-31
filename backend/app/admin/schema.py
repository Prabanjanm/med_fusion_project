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
    is_verified: Optional[bool] = None

    class Config:
        from_attributes = True

class NGOResponse(BaseModel):
    id: int
    ngo_name: str
    is_verified: Optional[bool] = None

    class Config:
        from_attributes = True