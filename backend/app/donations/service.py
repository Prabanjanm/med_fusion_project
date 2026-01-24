class DonationService:
    _donations = []
    _counter = 1

    @classmethod
    def create_donation(cls, data):
        donation = {
            "donation_id": cls._counter,
            "item_name": data.item_name,
            "quantity": data.quantity,
            "purpose": data.purpose,
            "status": "RECORDED"
        }
        cls._donations.append(donation)
        cls._counter += 1
        return donation

    @classmethod
    def list_donations(cls):
        return cls._donations
