"""
Clear Dummy Donation Data
Run this script to remove all donation history from the database
"""

import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.donation import Donation
from app.models.allocation import Allocation
from app.models.receipt import Receipt

def clear_donation_data():
    """Clear all donation-related data from database"""
    db = SessionLocal()
    try:
        # Delete in correct order due to foreign key constraints
        print("Clearing receipts...")
        receipts_deleted = db.query(Receipt).delete()
        print(f"  Deleted {receipts_deleted} receipts")
        
        print("Clearing allocations...")
        allocations_deleted = db.query(Allocation).delete()
        print(f"  Deleted {allocations_deleted} allocations")
        
        print("Clearing donations...")
        donations_deleted = db.query(Donation).delete()
        print(f"  Deleted {donations_deleted} donations")
        
        db.commit()
        print("\n✅ Successfully cleared all donation data!")
        print("   The database is now clean.")
        
    except Exception as e:
        print(f"\n❌ Error clearing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("CLEAR DONATION DATA")
    print("=" * 50)
    print("\nThis will DELETE all donations, allocations, and receipts.")
    print("This action CANNOT be undone!")
    
    clear_donation_data()
