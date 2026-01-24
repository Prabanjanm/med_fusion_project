from pydantic import BaseModel, Field

class DonationCreate(BaseModel):
    item_name: str = Field(..., example="Medical Kits")
    quantity: int = Field(..., gt=0, example=100)
    purpose: str = Field(..., example="Rural health support")

class DonationResponse(BaseModel):
    donation_id: int
    item_name: str
    quantity: int
    purpose: str
    status: str
