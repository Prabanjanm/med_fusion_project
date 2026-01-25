# from app.models.user import User
# from app.auth.utils import verify_password, create_access_token

# USERS = {
#     "csr_user": User(
#         1,
#         "csr_user",
#         "$2b$12$89KpaoTciB4/fbkOSNTaMOvFbw88bfREi9INicvusV4AOEfxSyFGu", #eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjc3JfdXNlciIsInJvbGUiOiJjc3IxMjMiLCJleHAiOjE3NjkxNTA0MzF9.wezvtk5ojHCfG7ukjDkTMwJnyTLjcd8RAOegBVvvY80
#         "CSR"
#     ),
#     "ngo_user": User(
#         2,
#         "ngo_user",
#         "$2b$12$ugzbEdsU7ZXNUnEBUkC7r./I3dqWgptFpn2XTCSWEX5V6D2OSor/G",
#         "NGO"
#     ),
#     "clinic_user": User(
#         3,
#         "clinic_user",
#         "$2b$12$68fe7E6mvGi/N5DaHdhN7.v1kMP4.9IW4DUrmOEZHdeDSPGb0.Yqa",
#         "CLINIC"
#     ),
#     "auditor_user": User(
#         4,
#         "auditor_user",
#         "$2b$12$p2mcxz.0/qoM1dCpClvMT.rRJWDrkNjm3occn8DZe5.doj/teAcAm",
#         "AUDITOR"
#     ),
#     "admin_user": User(
#         4,
#         "admin_user",
#         "$2b$12$7t/O6J/2pA0kAshFU7vJlOegVBrySTdmbt9Nwl0PVxkXhoUIXVfwK",
#         "ADMIN"
#     ),
# }

# def authenticate(username: str, password: str):
#     user = USERS.get(username)
#     if not user:
#         return None

#     if not verify_password(password, user.password_hash):
#         return None

#     return create_access_token({
#         "sub": user.username,
#         "role": user.role
#     })

from sqlalchemy import select
from app.models.user import User
from app.models.company import Company
from app.auth.utils import verify_password, create_access_token


async def login_user(db, email: str, password: str):
    """
    Allow login ONLY if:
    - company is verified
    - password is set
    """

    result = await db.execute(
        select(User, Company)
        .join(Company, User.company_id == Company.id)
        .where(User.email == email)
    )
    row = result.first()

    if not row:
        raise ValueError("Invalid email or password")

    user, company = row

    # Debug logs (good for now)
    print("LOGIN ATTEMPT:", email)
    print("PASSWORD SET:", user.password_set)
    print("COMPANY VERIFIED:", company.is_verified)

    if not company.is_verified:
        raise ValueError("Company not verified")

    if not user.password_set:
        raise ValueError("Password not set. Please set password first.")

    if not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")

    token = create_access_token({
        "sub": user.email,
        "role": user.role,
        "company_id": user.company_id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }




from sqlalchemy import select
from app.models.user import User
from app.auth.utils import hash_password


async def set_password(db, email: str, password: str):
    """
    Set password for a verified company's user.
    """

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise ValueError("User not found")

    if user.password_set:
        raise ValueError("Password already set")

    user.password_hash = hash_password(password)
    user.password_set = True

    await db.commit()

    return {"message": "Password set successfully. You can now login."}

