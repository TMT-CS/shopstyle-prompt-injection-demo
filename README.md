# ShopStyle — Demo Tấn công Prompt Injection trên Web tích hợp Chatbot AI

Hệ thống mô phỏng một website bán quần áo có chatbot AI hỗ trợ khách hàng, được xây dựng **có chủ đích chứa lỗ hổng** để làm môi trường kiểm thử ba kỹ thuật Prompt Injection (**Direct**, **Indirect**, **Jailbreak**) và **5 biện pháp phòng chống**.

> ⚠️ **CẢNH BÁO AN TOÀN**
> Đây là môi trường mô phỏng có lỗ hổng cố ý (system prompt chứa key giả, tool `execute_sql`/`delete_user_account`...).
> **Chỉ chạy trên localhost.**

---

## Kiến trúc

| Thành phần | Công nghệ                                                                            |
| ---------- | ------------------------------------------------------------------------------------ |
| Frontend   | Next.js 14 (App Router) + Tailwind CSS                                               |
| Backend    | FastAPI + SQLAlchemy (SQLite)                                                        |
| Auth       | JWT (python-jose) + bcrypt                                                           |
| LLM        | **Ollama `qwen3:8b`** (mặc định, OpenAI-compatible) — Anthropic là fallback tùy chọn |
| Demo nhanh | `index.html` — SPA standalone (vanilla JS, không cần backend)                        |

Luồng Indirect Injection chính:

```
[System Prompt] + [User Message] + [Product Description] + [Comments] → LLM
                                    └──────── vector tấn công ────────┘
```

---

## Cấu trúc thư mục

```
demo/
├── index.html          # Demo standalone (mở trực tiếp bằng trình duyệt)
├── frontend/           # Next.js app (full)
│   ├── app/            # Trang chủ, chi tiết sản phẩm, auth, admin
│   ├── components/     # ChatBot, ProductCard, CommentSection, Navbar
│   └── lib/            # api client, auth context, types
├── backend/            # FastAPI app
│   ├── main.py         # Entrypoint (port 8000)
│   ├── seed.py         # Seed 20–30 sản phẩm + comments độc hại (Indirect)
│   ├── models.py / schemas.py / database.py / auth.py / services.py
│   ├── routers/        # products, comments, chat, users, admin
│   ├── llm/
│   │   ├── ollama_chat.py    # Agentic loop (Ollama)
│   │   ├── system_prompt.py  # VULNERABLE / HARDENED / JAILBREAK prompt
│   │   ├── defenses.py       # 5 biện pháp phòng chống (§2.6)
│   │   └── tools.py          # 6 LLM tools
│   └── .env.example    # Mẫu cấu hình (copy sang .env)
└── images/             # Ảnh sản phẩm (dùng bởi index.html)
```

---

## Yêu cầu hệ thống

- **Python** ≥ 3.10
- **Node.js** ≥ 18
- **Ollama** (chạy LLM local) — https://ollama.com

---

## Cài đặt & chạy

Cần **4 terminal** (hoặc chạy nền), theo thứ tự:

**1. Ollama — khởi động LLM (chỉ pull model lần đầu)**

```bash
ollama serve            # khởi động daemon (nếu chưa chạy)
ollama pull qwen3:8b    # tải model (chỉ cần 1 lần, ~5GB)
```

**2. Backend — FastAPI (port 8000)**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # rồi chỉnh JWT_SECRET_KEY... (Windows: copy .env.example .env)
python main.py
```

API docs: http://localhost:8000/docs

**3. Seed database (chỉ chạy 1 lần, sau khi backend đã tạo bảng)**

```bash
cd backend
python seed.py     # tạo sản phẩm mẫu + comments chứa Indirect Injection payload
```

> Cần reset dữ liệu? Chạy `python reset_db.py` rồi seed lại.

**4. Frontend — Next.js (port 3000)**

```bash
cd frontend
npm install
npm run dev
```

Truy cập ứng dụng: **http://localhost:3000**

---

## Cấu hình `.env`

Copy `backend/.env.example` → `backend/.env` và chỉnh:

```env
LLM_PROVIDER=ollama                         # "ollama" (mặc định) | "anthropic"
OLLAMA_MODEL=qwen3:8b
OLLAMA_BASE_URL=http://localhost:11434/v1
ANTHROPIC_API_KEY=sk-ant-...                # chỉ cần nếu dùng fallback Anthropic

DATABASE_URL=sqlite:///./shopstyle.db
JWT_SECRET_KEY=your-secret-key-here         # ĐỔI thành chuỗi bí mật của bạn
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

DEFENSE_ACTIVE=false                         # false = baseline (dính tấn công) | true = bật phòng thủ
JAILBREAK_SCENARIO=false                     # true = baseline có ranh giới vai trò cho kịch bản jailbreak
```

> `.env` **không được commit** (đã nằm trong `.gitignore`) vì chứa secret. Chỉ commit `.env.example`.

---

## Sử dụng: Tấn công & Phòng thủ

Toàn bộ cơ chế bật/tắt qua **2 biến môi trường**, sau khi đổi cần **khởi động lại backend**:

| Kịch bản                          | `DEFENSE_ACTIVE` | `JAILBREAK_SCENARIO` | Prompt dùng                                   |
| --------------------------------- | :--------------: | :------------------: | --------------------------------------------- |
| Baseline (Direct/Indirect)        |     `false`      |       `false`        | `VULNERABLE_PROMPT` (chứa key giả, đủ 6 tool) |
| Baseline có ranh giới (Jailbreak) |     `false`      |        `true`        | `JAILBREAK_PROMPT`                            |
| **Đã phòng thủ**                  |      `true`      |       (bỏ qua)       | `HARDENED_PROMPT`                             |

**5 biện pháp phòng chống** (kích hoạt khi `DEFENSE_ACTIVE=true` — `backend/llm/defenses.py`):

1. **System prompt an toàn hơn** — `HARDENED_PROMPT`
2. **Đánh dấu dữ liệu không tin cậy** — bọc `[UNTRUSTED]` / `<untrusted_data>` quanh mô tả + bình luận
3. **Lọc input nguy hiểm** — chặn mẫu prompt tấn công trước khi gọi LLM
4. **Kiểm tra đầu ra** — redact key/rò rỉ system prompt khỏi phản hồi
5. **Giới hạn quyền (allowlist tool)** — loại 4 tool nhạy cảm: `execute_sql`, `delete_user_account`, `update_user_email`, `reset_user_password`

**Cách demo:** đăng nhập → mở chatbot / trang chi tiết sản phẩm → gửi payload injection (hoặc gọi `GET /api/products/{id}/summary` để trigger Indirect qua comment độc hại). Bật/tắt `DEFENSE_ACTIVE` để so sánh trước/sau. Mỗi lượt chat được ghi log ở `backend/logs/chat_YYYY-MM-DD.jsonl` và bảng `chat_logs`.

---

## API chính

| Method   | Path                                     | Mô tả                                                 |
| -------- | ---------------------------------------- | ----------------------------------------------------- |
| POST     | `/api/auth/register` · `/api/auth/login` | Đăng ký / đăng nhập (JWT)                             |
| GET      | `/api/products` · `/api/products/{id}`   | Danh sách / chi tiết sản phẩm                         |
| GET      | `/api/products/{id}/summary`             | Chatbot tóm tắt SP — **vector Indirect Injection**    |
| GET/POST | `/api/products/{id}/comments`            | Xem / đăng bình luận                                  |
| POST     | `/api/chat`                              | Chat với AI (LLM có thể gọi tools)                    |
| POST     | `/api/admin/execute-sql`                 | ⚠ API nguy hiểm — chỉ dùng trong môi trường kiểm soát |

Chi tiết đầy đủ: http://localhost:8000/docs

---

## Ghi chú

- Dự án học thuật, mục đích giáo dục về an toàn thông tin. Không sử dụng cho mục đích tấn công thực tế.
- CORS backend chỉ cho phép `http://localhost:3000` trong môi trường dev.
