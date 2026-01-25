from pydantic import BaseModel


class DonationCreate(BaseModel):
    item_name: str
    quantity: int
