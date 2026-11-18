import os
from typing import Union, List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CTSO Management System (CMS)"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://cms_user:cms_password@127.0.0.1:5432/cms_db"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "ctso-cms-super-secret-key-production-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    PORT: int = int(os.getenv("PORT", "8001"))
    CORS_ORIGINS: Union[str, List[str]] = ["*"]

    @property
    def cors_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
