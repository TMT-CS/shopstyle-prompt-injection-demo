---
description: Logging format, nơi lưu và schema JSON cho chat log thực nghiệm
globs:
  - "backend/**"
  - "backend/routers/chat.py"
alwaysApply: false
---

# Logging — Chat Log Thực Nghiệm

Mỗi lần chatbot được gọi, ghi log vào **hai nơi đồng thời**:

1. **Database** — bảng `chat_logs` (xem [database-schema.md](database-schema.md))
2. **File** — `backend/logs/chat_YYYY-MM-DD.jsonl` (mỗi dòng là 1 JSON record)

## Log Record Format

```json
{
  "timestamp": "2026-06-08T10:30:00",
  "session_id": "abc123",
  "user_id": 5,
  "user_message": "Tóm tắt sản phẩm 1",
  "system_prompt_hash": "sha256:abcdef...",
  "context_length": 1200,
  "llm_response": "Sản phẩm được đánh giá cao...",
  "tools_called": [
    {"name": "get_product_info", "input": {"product_id": 1}},
    {"name": "get_product_comments", "input": {"product_id": 1}}
  ],
  "attack_type": null,
  "defense_active": false
}
```

## Trường quan trọng

| Trường | Giá trị | Mục đích phân tích |
|--------|---------|-------------------|
| `attack_type` | `null` / `"direct"` / `"indirect"` / `"jailbreak"` | Phân loại tấn công |
| `defense_active` | `true` / `false` | Ghi nhận trạng thái phòng thủ tại thời điểm gọi |
| `system_prompt_hash` | SHA-256 | Xác định phiên bản prompt nào đang dùng |
| `context_injected` | string | Toàn bộ context đưa vào LLM — dùng để verify injection |
| `tools_called` | JSON array | Kiểm tra LLM có gọi tool nguy hiểm không |

## Lưu ý

- `user_id` có thể là `null` nếu người dùng anonymous.
- Dùng `system_prompt_hash` thay vì lưu toàn bộ prompt để giảm dung lượng DB.
- File JSONL format (JSON Lines) — mỗi dòng độc lập, dễ stream và parse.
