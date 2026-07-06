import os
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth as auth_module
from llm.system_prompt import get_system_prompt
from llm.tools import TOOL_DEFINITIONS, execute_tool
from llm import defenses

router = APIRouter(prefix="/api/chat", tags=["chat"])

LOGS_DIR = Path(__file__).parent.parent / "logs"
LOGS_DIR.mkdir(exist_ok=True)

MAX_TOOL_ROUNDS = 5


def _detect_attack_type(message: str, context: str = "") -> Optional[str]:
    msg_lower = message.lower()
    direct_kw = ["ignore previous", "ignore all", "forget all", "system prompt",
                 "reveal your", "what is your prompt", "tiet lo", "system:", "bo qua",
                 "forget previous", "new instruction", "disregard"]
    jailbreak_kw = ["jailbreak", "no restriction", "unrestricted", "pretend you are",
                    "act as if", "you are now", "dong vai", "gia vo",
                    "maintenance mode", "developer mode"]
    indirect_kw = ["new instruction", "system override", "injection", "now you are",
                   "your new task", "stop acting", "indirect injection", "[system", "<!-- new"]
    if any(k in msg_lower for k in direct_kw):
        return "direct"
    if any(k in msg_lower for k in jailbreak_kw):
        return "jailbreak"
    if context and any(k in context.lower() for k in indirect_kw):
        return "indirect"
    return None


def _write_jsonl_log(record: dict):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    log_file = LOGS_DIR / f"chat_{today}.jsonl"
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def _save_db_log(db, session_id, user_id, user_message, system_prompt,
                 context_injected, llm_response, tools_called, attack_type, defense_active=False):
    log = models.ChatLog(
        session_id=session_id, user_id=user_id, user_message=user_message,
        system_prompt=system_prompt, context_injected=context_injected,
        llm_response=llm_response, tools_called=tools_called, attack_type=attack_type,
        defense_active=defense_active,
    )
    db.add(log)
    db.commit()


# Tool đọc dữ liệu ngoài (untrusted) — kết quả cần đánh dấu [UNTRUSTED] khi defense bật
_UNTRUSTED_TOOLS = ("get_product_comments", "get_product_info")


def _run_ollama(message: str, system_prompt: str, db, current_user, tools):
    """Agentic loop dùng Ollama (OpenAI-compatible). `tools` đã lọc theo DEFENSE_ACTIVE."""
    from llm.ollama_chat import run_chat
    model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
    return run_chat(
        message=message,
        system_prompt=system_prompt,
        tools=tools,
        model=model,
        db=db,
        current_user=current_user,
        execute_tool_fn=execute_tool,
    )


@router.post("", response_model=schemas.ChatResponse)
def chat(
    body: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth_module.get_optional_user),
):
    system_prompt, _ = get_system_prompt()
    system_prompt_hash = "sha256:" + hashlib.sha256(system_prompt.encode()).hexdigest()[:16]
    provider = "ollama"
    defense = defenses.defense_active()
    # Chụp user_id TRƯỚC vòng lặp: nếu tool (delete_user_account) xóa current_user thì
    # sau đó truy cập current_user.id sẽ lỗi (session/đối tượng không còn).
    user_id = current_user.id if current_user else None

    # 2.6.3 — Input filter: chặn mẫu prompt nguy hiểm trước khi gọi LLM
    blocked, refusal = defenses.check_input(body.message)
    if blocked:
        final_response = refusal
        tools_called_log = []
        context_injected = ""
    else:
        # 2.6.5 — Giới hạn quyền: lọc tool nhạy cảm khi defense bật
        active_tools = defenses.filter_tools(TOOL_DEFINITIONS)
        try:
            final_response, tools_called_log, context_injected = _run_ollama(
                body.message, system_prompt, db, current_user, active_tools
            )
        except Exception as e:
            err = str(e)
            if "Connection refused" in err or "connect" in err.lower():
                raise HTTPException(status_code=503, detail="Ollama chua chay. Mo terminal chay: ollama serve")
            if "model" in err.lower() and "not found" in err.lower():
                model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
                raise HTTPException(status_code=503, detail=f"Model chua duoc pull. Chay: ollama pull {model}")
            raise HTTPException(status_code=502, detail=f"LLM error: {err}")

        # 2.6.4 — Output validation: redact secret / rò rỉ prompt khỏi response
        final_response = defenses.validate_output(final_response)

    attack_type = _detect_attack_type(body.message, context_injected)

    log_record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": body.session_id,
        "user_id": user_id,
        "user_message": body.message,
        "system_prompt_hash": system_prompt_hash,
        "context_length": len(context_injected),
        "context_injected": context_injected,
        "llm_response": final_response,
        "tools_called": tools_called_log,
        "attack_type": attack_type,
        "defense_active": defense,
        "provider": provider,
    }
    _write_jsonl_log(log_record)
    _save_db_log(
        db=db, session_id=body.session_id,
        user_id=user_id,
        user_message=body.message, system_prompt=system_prompt,
        context_injected=context_injected, llm_response=final_response,
        tools_called=tools_called_log, attack_type=attack_type,
        defense_active=defense,
    )

    return schemas.ChatResponse(
        response=final_response,
        tools_called=tools_called_log,
        attack_type=attack_type,
        defense_active=defense,
    )
