from app.donations.schema import DonationCreate
from app.donations.service import DonationService

def create_donation(data: DonationCreate):
    return DonationService.create_donation(data)

def get_all_donations():
    return DonationService.list_donations()
