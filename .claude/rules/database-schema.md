---
description: Schema các bảng SQLite — users, products, comments, chat_logs
globs:
  - "backend/**"
  - "backend/models.py"
  - "backend/schemas.py"
alwaysApply: false
---

# Database Schema (SQLite / SQLAlchemy)

## Bảng `users`

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | INTEGER PK | Auto-increment |
| username | TEXT UNIQUE | |
| email | TEXT UNIQUE | |
| hashed_password | TEXT | bcrypt hash |
| role | TEXT | `"user"` hoặc `"admin"` |
| created_at | DATETIME | |

## Bảng `products`

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | INTEGER PK | |
| name | TEXT | Tên sản phẩm |
| description | TEXT | Mô tả dài — **nguồn Indirect Injection** |
| price | REAL | |
| category | TEXT | `"ao"` \| `"quan"` \| `"vay"` \| `"phu_kien"` |
| image_url | TEXT | |
| stock | INTEGER | |

## Bảng `comments`

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | INTEGER PK | |
| product_id | INTEGER FK | Liên kết products |
| user_id | INTEGER FK | Liên kết users |
| content | TEXT | **Vector Indirect Prompt Injection** — LLM đọc nội dung này |
| rating | INTEGER | 1–5 |
| created_at | DATETIME | |

> ⚠ Trường `content` là nguồn tấn công Indirect Injection: kẻ tấn công nhúng payload vào đây, LLM đọc khi tóm tắt sản phẩm.

## Bảng `chat_logs`

| Cột | Kiểu | Ghi chú |
|-----|------|---------|
| id | INTEGER PK | |
| session_id | TEXT | UUID phiên chat |
| user_id | INTEGER nullable | Null nếu anonymous |
| user_message | TEXT | Input gốc từ người dùng |
| system_prompt | TEXT | System prompt tại thời điểm gọi |
| context_injected | TEXT | Dữ liệu ngữ cảnh (description + comments) đưa vào LLM |
| llm_response | TEXT | Phản hồi của LLM |
| tools_called | JSON | Danh sách tool calls LLM thực hiện |
| attack_type | TEXT | `null` \| `"direct"` \| `"indirect"` \| `"jailbreak"` |
| timestamp | DATETIME | |
