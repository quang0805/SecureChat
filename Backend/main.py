from fastapi import FastAPI
from app.core.config import settings
from app.api.api import api_router, ws_router
from app.core.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware


# Tạo các bảng trong database dựa trên models
# Chỉ chạy lần đầu hoặc khi có thay đổi models
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

# CORS
origins = [
    "http://localhost",
    "http://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}