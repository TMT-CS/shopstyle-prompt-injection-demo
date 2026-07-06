---
description: Bối cảnh, mục đích và các ràng buộc an toàn của dự án demo Prompt Injection
alwaysApply: true
---

# Bối cảnh dự án

Đây là ứng dụng **demo phục vụ nghiên cứu học thuật** cho chuyên đề:
> "Tấn công Prompt Injection trên ứng dụng web tích hợp chatbot AI và cách phòng chống"
> Ban Cơ yếu Chính phủ — Học viện Kỹ thuật Mật mã — Khoa An toàn thông tin, Hà Nội 2026.
> Nhóm: Trần Minh Thanh (AT200155), Nguyễn Văn Đáp (AT200109), Phùng Văn Hưng (AT200124).
> GVHD: ThS. Lê Thị Hồng Vân (Khoa Công nghệ thông tin). Deadline báo cáo: 21/06/2026.

Hệ thống mô phỏng website bán quần áo với chatbot AI hỗ trợ khách hàng, được xây dựng **có chủ đích chứa lỗ hổng** để làm môi trường kiểm thử các kỹ thuật Prompt Injection (Direct, Indirect, Jailbreak).

## Ràng buộc quan trọng

- **Không deploy ra internet** — chỉ chạy trên localhost.
- **API nguy hiểm** (`execute_sql`, `delete_user_account`) chỉ dùng trong môi trường kiểm soát.
- Duy trì **2 phiên bản system prompt** trong cùng file `backend/llm/system_prompt.py` (hằng `VULNERABLE_PROMPT` baseline + `HARDENED_PROMPT` sau phòng thủ), toggle qua `get_system_prompt()` + env var `DEFENSE_ACTIVE=false/true`.
- Seed data phải có ít nhất **3 comments chứa Indirect Injection payload** để demo.
- CORS backend chỉ cho phép `http://localhost:3000` trong dev.

## Phạm vi của file index.html

File `index.html` là **standalone demo frontend** — toàn bộ data, chatbot logic và phản hồi AI được mô phỏng trong JS (không cần backend chạy). Đây là file demo chính cho bài báo cáo.
