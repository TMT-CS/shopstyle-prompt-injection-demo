---
description: Biến môi trường (.env), lệnh chạy backend/frontend và lệnh seed database
alwaysApply: false
---

# Environment & Commands

## Biến môi trường

Tạo file `backend/.env`:

```env
# LLM provider: "ollama" (mặc định) hoặc "anthropic" (fallback)
LLM_PROVIDER=ollama
OLLAMA_MODEL=qwen3:8b
OLLAMA_BASE_URL=http://localhost:11434/v1
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=sqlite:///./shopstyle.db

# Auth
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Defense toggle — false = vulnerable (baseline), true = hardened
DEFENSE_ACTIVE=false
```

> ⚠ Đây chỉ là `.env` mẫu — dùng giá trị **placeholder**. KHÔNG commit API key/JWT secret thật.

Tạo file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Lệnh chạy

```bash
# Ollama (provider mặc định) — chạy trước backend
ollama serve            # khởi động daemon (nếu chưa chạy)
ollama pull qwen3:8b    # tải model (chỉ cần 1 lần)

# Backend (port 8000)
cd backend
pip install -r requirements.txt
python main.py

# Seed database (chạy sau khi backend khởi động lần đầu)
python seed.py

# Frontend Next.js (port 3000)
cd frontend
npm install
npm run dev

# Demo standalone (không cần backend)
# Mở trực tiếp file index.html trong trình duyệt
```

## Thứ tự khởi động

1. Khởi động Ollama: `ollama serve` + `ollama pull qwen3:8b` (lần đầu)
2. Khởi động backend: `python main.py` (port 8000)
3. Seed data: `python seed.py` (chỉ cần chạy 1 lần)
4. Khởi động frontend: `npm run dev` (port 3000)
5. Truy cập: `http://localhost:3000`
