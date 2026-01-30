import smtplib
from email.message import EmailMessage
from app.core.config import settings


async def send_clinic_invitation_email(
    to_email: str,
    clinic_name: str,
    invite_link: str,
    ngo_name: str,
    csr1_number: str,
    reference_id: str,
):
    """
    Send clinic onboarding invitation email via Brevo SMTP
    """

    subject = "Invitation to join CSR HealthTrace as a Registered Clinic"

    body = f"""
Hello,

You have been invited to join CSR HealthTrace, a CSR healthcare transparency platform.

Inviting NGO:
- Name: {ngo_name}
- CSR-1 Registration: {csr1_number}
- Status: Verified

This invitation was generated through the CSR HealthTrace platform.

👉 Click below to securely accept the invitation and set your password:
{invite_link}

Invitation Reference ID: {reference_id}

If you were not expecting this invitation, please ignore this email.

— CSR HealthTrace Platform
"""

    msg = EmailMessage()
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    print("Email prepared, sending via SMTP...")
    # Use a short socket timeout to fail fast on networking issues.
    timeout_seconds = getattr(settings, "EMAIL_TIMEOUT", 10)
    print("Timeout seconds:", timeout_seconds)
    try:
        # Port 465 commonly expects SSL immediately, while 587 uses STARTTLS
        print("SMTP Port:", settings.BREVO_SMTP_PORT)
        print("SMTP Server:", settings.BREVO_SMTP_SERVER)
        print("SMTP Login:", settings.BREVO_SMTP_LOGIN)
        if settings.BREVO_SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=timeout_seconds,
            )
            print("Using SMTP_SSL")
            with server as s:
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)
        else:
            print("Using SMTP with STARTTLS")
            server = smtplib.SMTP(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=timeout_seconds,
            )
            print("Using SMTP with STARTTLS")
            with server as s:
                s.starttls()
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)

        return True

    except Exception as exc:
        # Raise a clear error so callers can decide how to handle it
        raise RuntimeError(f"Failed to send email: {exc}") from exc
