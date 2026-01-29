from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application configuration settings.
    """

    DATABASE_URL: str
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    RESEND_API_KEY: str
    RESEND_FROM_EMAIL: str
    FRONTEND_URL: str

    class Config:
        env_file = ".env"


settings = Settings()
