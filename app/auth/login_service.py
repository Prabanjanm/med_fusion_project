from app.core.supabase import supabase


async def login_user(email: str, password: str):
    """
    Logs in user using email + password.
    """
    response = supabase.auth.signInWithPassword({
        "email": email,
        "password": password
    })

    if response.user is None:
        raise ValueError("Invalid credentials")

    return {
        "access_token": response.session.access_token,
        "user": response.user
    }
