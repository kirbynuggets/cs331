"""Application configuration"""


class Settings:
    """Application settings"""

    DATABASE_URL: str = "mysql+pymysql://fashion_user:securepass@localhost/fashion_db"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
