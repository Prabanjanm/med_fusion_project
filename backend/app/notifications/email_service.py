import resend
from app.core.config import settings

# Configure API key once
resend.api_key = settings.RESEND_API_KEY


async def send_clinic_invitation_email(
    *,
    to_email: str,
    clinic_name: str,
    ngo_name: str,
    csr1_number: str,
    invite_link: str,
    reference_id: str
):
    """
    Send platform-signed clinic invitation email using Resend.
    """

    resend.Emails.send({
        "from": settings.RESEND_FROM_EMAIL,
        "to": [to_email],
        "subject": "Invitation to join CSR HealthTrace as a Registered Clinic",
        "html": f"""
        <p>Hello <strong>{clinic_name}</strong>,</p>

        <p>You have been invited to join <strong>CSR HealthTrace</strong>,
        a CSR healthcare transparency platform, by:</p>

        <ul>
          <li><strong>NGO Name:</strong> {ngo_name}</li>
          <li><strong>CSR-1 Registration:</strong> {csr1_number}</li>
          <li><strong>Verification Status:</strong> Verified</li>
        </ul>

        <p>This invitation was issued through the CSR HealthTrace platform
        after NGO verification.</p>

        <p>
          <a href="{invite_link}"
             style="padding:12px 18px;
                    background:#2563eb;
                    color:white;
                    text-decoration:none;
                    border-radius:6px;
                    font-weight:bold;">
             Accept Invitation & Set Password
          </a>
        </p>

        <p><strong>Invitation Reference:</strong> {reference_id}</p>

        <p>If you were not expecting this invitation, please ignore this email.</p>

        <p>— CSR HealthTrace Platform</p>
        """
    })
