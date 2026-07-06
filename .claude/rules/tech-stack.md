---
description: Tech stack, framework versions và cấu trúc thư mục dự án
alwaysApply: true
---

# Tech Stack

## Frontend (Next.js)
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI components:** shadcn/ui (theme dark)
- **Icons:** Lucide React
- **HTTP client:** axios hoặc fetch API

## Backend (FastAPI)
- **Framework:** FastAPI (Python)
- **Database:** SQLite dùng SQLAlchemy ORM
- **Auth:** JWT với python-jose
- **Password hashing:** bcrypt (passlib)
- **LLM integration:** 2 provider — **Ollama `qwen3:8b`** (mặc định, qua OpenAI-compatible API tại `http://localhost:11434/v1`, dùng SDK `openai`) và **Anthropic Python SDK (`anthropic`)** làm fallback. Chọn qua env `LLM_PROVIDER`.
- **CORS:** fastapi.middleware.cors

## Cấu trúc thư mục

```
demo/
├── index.html             # Standalone demo SPA (vanilla JS)
├── frontend/              # Next.js app (full stack)
│   ├── app/
│   │   ├── page.tsx              # Trang chủ / danh sách sản phẩm
│   │   ├── products/[id]/page.tsx # Chi tiết sản phẩm + bình luận
│   │   ├── auth/login/page.tsx
│   │   ├── auth/register/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ChatBot.tsx           # Widget chatbot AI
│   │   ├── ProductCard.tsx
│   │   ├── CommentSection.tsx
│   │   └── Navbar.tsx
│   └── lib/
│       └── api.ts                # API client
├── backend/               # FastAPI app
│   ├── main.py
│   ├── models.py          # SQLAlchemy models
│   ├── schemas.py         # Pydantic schemas
│   ├── database.py
│   ├── auth.py            # JWT logic
│   ├── routers/
│   │   ├── products.py
│   │   ├── comments.py
│   │   ├── chat.py        # LLM integration + tools
│   │   ├── users.py
│   │   └── admin.py       # Dangerous APIs for demo
│   ├── llm/
│   │   ├── client.py            # Anthropic client (fallback)
│   │   ├── ollama_chat.py       # Ollama agentic loop (OpenAI-compatible, mặc định)
│   │   ├── system_prompt.py     # VULNERABLE_PROMPT + HARDENED_PROMPT + get_system_prompt()
│   │   ├── defenses.py          # 5 biện pháp phòng chống (gắn DEFENSE_ACTIVE)
│   │   └── tools.py
│   └── logs/              # Chat log files (JSONL)
└── .claude/rules/         # Claude Code rules
```
