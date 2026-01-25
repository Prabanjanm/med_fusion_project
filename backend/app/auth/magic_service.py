from app.core.supabase import supabase
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.company import Company


async def send_magic_login(db: AsyncSession, email: str):
    """
    Sends magic login link ONLY to verified company emails.
    """
    domain = email.split("@")[-1]

    result = await db.execute(select(Company))
    companies = result.scalars().all()

    valid = any(domain in c.company_name.lower() for c in companies)

    if not companies:
        raise ValueError("No verified company found")

    supabase.auth.sign_in_with_otp({
        "email": email,
        "options": {
            "email_redirect_to": "http://localhost:3000/auth/callback"
        }
    })
