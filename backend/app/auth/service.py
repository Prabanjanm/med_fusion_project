from app.models.user import User
from app.auth.utils import verify_password, create_access_token

USERS = {
    "csr_user": User(
        1,
        "csr_user",
        "$2b$12$89KpaoTciB4/fbkOSNTaMOvFbw88bfREi9INicvusV4AOEfxSyFGu", #eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjc3JfdXNlciIsInJvbGUiOiJjc3IxMjMiLCJleHAiOjE3NjkxNTA0MzF9.wezvtk5ojHCfG7ukjDkTMwJnyTLjcd8RAOegBVvvY80
        "CSR"
    ),
    "ngo_user": User(
        2,
        "ngo_user",
        "$2b$12$ugzbEdsU7ZXNUnEBUkC7r./I3dqWgptFpn2XTCSWEX5V6D2OSor/G",
        "NGO"
    ),
    "clinic_user": User(
        3,
        "clinic_user",
        "$2b$12$68fe7E6mvGi/N5DaHdhN7.v1kMP4.9IW4DUrmOEZHdeDSPGb0.Yqa",
        "CLINIC"
    ),
    "auditor_user": User(
        4,
        "auditor_user",
        "$2b$12$p2mcxz.0/qoM1dCpClvMT.rRJWDrkNjm3occn8DZe5.doj/teAcAm",
        "AUDITOR"
    ),
}

def authenticate(username: str, password: str):
    user = USERS.get(username)
    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return create_access_token({
        "sub": user.username,
        "role": user.role
    })
