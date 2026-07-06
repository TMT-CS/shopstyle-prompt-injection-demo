---
description: Toàn bộ API endpoints — Auth, Products, Comments, Chat, User, Admin
globs:
  - "backend/routers/**"
  - "frontend/lib/**"
alwaysApply: false
---

# API Endpoints

Base URL: `http://localhost:8000`

## Auth

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập — trả `access_token` (JWT) |
| GET | `/api/auth/me` | Thông tin user hiện tại (Bearer token required) |

## Products

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/products` | Danh sách sản phẩm — query param `?category=ao` |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/products/{id}/summary` | **Chatbot tóm tắt sản phẩm** — LLM đọc description + comments, đây là endpoint trigger Indirect Injection |

## Comments

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/products/{id}/comments` | Lấy bình luận sản phẩm |
| POST | `/api/products/{id}/comments` | Đăng bình luận (Bearer token required) |

## Chat

| Method | Path | Body | Mô tả |
|--------|------|------|-------|
| POST | `/api/chat` | `{ message, session_id, product_id? }` | Gửi message tới chatbot AI — LLM có thể gọi tools |

## User APIs (LLM tools — có thể bị tấn công gọi)

| Method | Path | Mô tả |
|--------|------|-------|
| PUT | `/api/users/me/email` | Cập nhật email người dùng |
| POST | `/api/users/me/reset-password` | Đặt lại mật khẩu |
| DELETE | `/api/users/me` | Xóa tài khoản |

> ⚠ 3 endpoints này là mục tiêu của Indirect/Direct Injection — LLM có thể bị lừa gọi chúng.

## Ánh xạ 6 API LLM (đề cương §2.4)

6 tool LLM (`backend/llm/tools.py: TOOL_DEFINITIONS`) ánh xạ theo đánh số đề cương:

| Đề cương | Tool LLM tương ứng |
|----------|-------------------|
| 2.4.1 truy xuất thông tin sản phẩm + bình luận | `get_product_info` **+** `get_product_comments` (đề cương gộp chung, code tách 2 tool) |
| 2.4.2 tóm tắt sản phẩm | endpoint `GET /api/products/{id}/summary` (vector Indirect chính) |
| 2.4.3 chỉnh sửa email | `update_user_email` |
| 2.4.4 đặt lại mật khẩu | `reset_user_password` |
| 2.4.5 xóa tài khoản | `delete_user_account` |
| 2.4.6 thực thi SQL | `execute_sql` |

## Admin APIs (chỉ dùng trong môi trường kiểm soát)

| Method | Path | Mô tả |
|--------|------|-------|
| POST | `/api/admin/execute-sql` | Thực thi SQL query trực tiếp |
| GET | `/api/admin/logs` | Xem log thực nghiệm |
| DELETE | `/api/admin/logs` | Xóa toàn bộ log |

> ⚠ `execute_sql` là API nguy hiểm nhất — minh họa SQL injection qua LLM tool use.
