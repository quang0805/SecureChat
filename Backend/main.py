from fastapi import FastAPI
from app.core.config import settings
from app.api.api import api_router, ws_router
from app.core.database import engine, Base

# Tạo các bảng trong database dựa trên models
# Chỉ chạy lần đầu hoặc khi có thay đổi models
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}