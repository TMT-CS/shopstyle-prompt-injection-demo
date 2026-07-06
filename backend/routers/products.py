import os
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
import models
import schemas
from llm.system_prompt import get_system_prompt
from llm import defenses
from routers.chat import _detect_attack_type, _write_jsonl_log, _save_db_log
import services

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=List[schemas.ProductOut])
def list_products(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Product)
    if category:
        q = q.filter(models.Product.category == category)
    return q.all()


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = services.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại.")
    return product


@router.get("/{product_id}/summary")
def product_summary(product_id: int, db: Session = Depends(get_db)):
    """Endpoint tóm tắt sản phẩm — LLM đọc description + comments (vector Indirect Injection)."""
    product = services.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại.")

    comments = services.get_comments(db, product_id)
    comment_texts = []
    for c in comments:
        username = c.user.username if c.user else "anonymous"
        comment_texts.append(f"[{username} - {c.rating}★]: {c.content}")

    system_prompt, defense_active = get_system_prompt()

    # Context inline (raw) — đây là vector Indirect Injection: description + comments
    raw_context = f"""Thông tin sản phẩm:
Tên: {product.name}
Giá: {product.price:,.0f} VNĐ
Mô tả: {product.description}

Bình luận từ khách hàng:
{chr(10).join(comment_texts) if comment_texts else 'Chưa có bình luận.'}"""

    # 2.6.2 — đánh dấu dữ liệu không tin cậy trước khi đưa vào LLM (chỉ khi defense bật)
    llm_context = defenses.wrap_untrusted(raw_context)
    user_content = f"Hãy tóm tắt đánh giá khách hàng về sản phẩm sau:\n\n{llm_context}"

    provider = "ollama"
    try:
        from llm.ollama_chat import simple_completion
        model = os.getenv("OLLAMA_MODEL", "qwen3:8b")
        summary = simple_completion(system_prompt, user_content, model)
    except Exception as e:
        summary = f"[Demo mode] Chatbot chưa sẵn sàng. Lỗi: {str(e)}"

    # 2.6.4 — output validation
    summary = defenses.validate_output(summary)

    # Logging giống /api/chat: phân loại tấn công trên context inline + ghi DB + JSONL
    attack_type = _detect_attack_type("Tóm tắt đánh giá sản phẩm", raw_context)
    system_prompt_hash = "sha256:" + hashlib.sha256(system_prompt.encode()).hexdigest()[:16]
    session_id = f"summary_{product_id}"
    user_message = f"[/summary] Tóm tắt sản phẩm {product_id}"

    _write_jsonl_log({
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "session_id": session_id,
        "user_id": None,
        "user_message": user_message,
        "system_prompt_hash": system_prompt_hash,
        "context_length": len(raw_context),
        "context_injected": raw_context,
        "llm_response": summary,
        "tools_called": [],
        "attack_type": attack_type,
        "defense_active": defense_active,
        "provider": provider,
    })
    _save_db_log(
        db=db, session_id=session_id, user_id=None, user_message=user_message,
        system_prompt=system_prompt, context_injected=raw_context,
        llm_response=summary, tools_called=[], attack_type=attack_type,
        defense_active=defense_active,
    )

    return {
        "product_id": product_id,
        "product_name": product.name,
        "summary": summary,
        "attack_type": attack_type,
        "defense_active": defense_active,
    }
