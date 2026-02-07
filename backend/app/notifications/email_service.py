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


async def send_csr_password_setup_email(
    to_email: str,
    company_name: str,
    csr_uid: str,
    invite_link: str,
):
    subject = "Set your password – CSR HealthTrace"

    body = f"""
Hello,

Your company has been verified on the CSR HealthTrace platform.

Company Details:
- Company Name: {company_name}
- CSR UID: {csr_uid}
- Verification Status: Approved

👉 Click below to securely set your password:
{invite_link}

If you did not request this, please ignore this email.

— CSR HealthTrace Platform
"""
    print("token in email service:", invite_link.split("token=")[-1])
    msg = EmailMessage()
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        if settings.BREVO_SMTP_PORT == 465:
            with smtplib.SMTP_SSL(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=settings.EMAIL_TIMEOUT,
            ) as s:
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)
        else:
            with smtplib.SMTP(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=settings.EMAIL_TIMEOUT,
            ) as s:
                s.starttls()
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)

        return True

    except Exception as exc:
        raise RuntimeError(f"Failed to send CSR email: {exc}") from exc


async def send_ngo_password_setup_email(
    to_email: str,
    ngo_name: str,
    ngo_uid: str,
    invite_link: str,
):
    subject = "Set your password – CSR HealthTrace (NGO)"

    body = f"""
Hello,

Your NGO has been verified on the CSR HealthTrace platform.

NGO Details:
- NGO Name: {ngo_name}
- NGO UID: {ngo_uid}
- Verification Status: Approved

👉 Click below to securely set your password:
{invite_link}

If you were not expecting this, please ignore this email.

— CSR HealthTrace Platform
"""

    msg = EmailMessage()
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)

    try:
        if settings.BREVO_SMTP_PORT == 465:
            with smtplib.SMTP_SSL(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=settings.EMAIL_TIMEOUT,
            ) as s:
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)
        else:
            with smtplib.SMTP(
                settings.BREVO_SMTP_SERVER,
                settings.BREVO_SMTP_PORT,
                timeout=settings.EMAIL_TIMEOUT,
            ) as s:
                s.starttls()
                s.login(settings.BREVO_SMTP_LOGIN, settings.BREVO_SMTP_KEY)
                s.send_message(msg)

        return True

    except Exception as exc:
        raise RuntimeError(f"Failed to send NGO email: {exc}") from exc

