import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from database import engine, Base
import models  # noqa: F401 — registers models with Base

from routers import auth, products, comments, chat, users, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopStyle API",
    description="Backend cho demo nghiên cứu Prompt Injection — Học viện KT Mật mã 2026",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(comments.router)
app.include_router(chat.router)
app.include_router(users.router)
app.include_router(admin.router)


@app.get("/")
def root():
    defense = os.getenv("DEFENSE_ACTIVE", "false").lower() == "true"
    return {
        "service": "ShopStyle API",
        "version": "1.0.0",
        "defense_active": defense,
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
