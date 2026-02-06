from sqlalchemy.ext.asyncio import AsyncEngine
from app.db.database import engine
from app.db.base import Base

# Import models so SQLAlchemy knows them
from app.models.company import Company
from app.models.clinic import Clinic  
from app.models.ngo import NGO
from app.models.user import User
from app.models.trusted_company import TrustedCompany
from app.models.trusted_ngo import TrustedNGO
from app.models.donation import Donation
from app.models.admin_audit_log import AdminAuditLog


async def init_db() -> None:
    """
    Creates all database tables defined in SQLAlchemy models.
    Should be executed once during application bootstrap.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
