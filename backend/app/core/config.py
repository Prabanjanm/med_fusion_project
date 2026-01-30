from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration settings.
    """

    DATABASE_URL: str
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    BREVO_SMTP_SERVER: str
    BREVO_SMTP_PORT: int
    BREVO_SMTP_LOGIN: str
    BREVO_SMTP_KEY: str

    EMAIL_FROM_NAME: str
    EMAIL_FROM_ADDRESS: str
    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
