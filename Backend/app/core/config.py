from pydantic_settings import BaseSettings
from pydantic import field_validator # Import thêm cái này để validate dữ liệu

class Settings(BaseSettings):
    PROJECT_NAME: str = "SecureChat Application"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "" 
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1000

    # Tự động sửa lỗi postgres:// thành postgresql://
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if v and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    class Config:
        env_file = ".env"
        extra = "ignore" # Bỏ qua các biến thừa trong file env nếu có

settings = Settings()