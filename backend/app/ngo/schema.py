from pydantic import BaseModel, Field
from datetime import datetime


class NGORegister(BaseModel):
    ngo_name: str = Field(..., example="Health Reach Foundation")
    csr_1_number: str = Field(..., example="CSR00012345")
    has_80g: bool = Field(..., example=True)
    official_email: str = Field(..., example="ngo@healthreach.org")


class ClinicCreate(BaseModel):
    """Schema for creating a new clinic"""
    clinic_name: str
    facility_id: str
    facility_id_type: str  # ABHA / CEA
    doctor_registration_number: str | None = None
    pincode: str
    official_email: str

    class Config:
        from_attributes = True

class ClinicNeedCreate(BaseModel):
    clinic_id: int
    item_name: str
    quantity: int
    purpose: str
    priority: int

class DonationAllocationResponse(BaseModel):
    id: int
    donation_id: int
    clinic_requirement_id: int
    allocated_at: datetime

    class Config:
        from_attributes = True

class AllocationCreate(BaseModel):
    donation_id: int
    clinic_requirement_id: int