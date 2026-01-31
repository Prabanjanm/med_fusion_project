from app.core.supabase import supabase


async def create_csr_user(email: str):
    """
    Creates a CSR user account without password.
    User will set password manually.
    """
    response = supabase.auth.admin.create_user({
        "email": email,
        "email_confirm": True
    })

    return response
