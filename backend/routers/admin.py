import glob as glob_module
import hashlib
import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth as auth_module
import services

router = APIRouter(prefix="/api/admin", tags=["admin"])

LOGS_DIR = Path(__file__).parent.parent / "logs"


@router.post("/execute-sql")
def execute_sql(
    body: schemas.SQLQuery,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    """Thực thi SQL trực tiếp — CHỈ DÙNG TRONG MÔI TRƯỜNG KIỂM SOÁT."""
    try:
        result = services.run_raw_sql(db, body.query, commit=True)
        try:
            rows = result.fetchall()
            cols = list(result.keys())
            return {
                "columns": cols,
                "rows": [dict(zip(cols, row)) for row in rows],
                "rowcount": len(rows),
            }
        except Exception:
            return {"message": "Truy vấn thực thi thành công.", "rowcount": result.rowcount}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"SQL error: {str(e)}")


@router.get("/logs")
def get_logs(
    limit: int = 100,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    db_logs = (
        db.query(models.ChatLog)
        .order_by(models.ChatLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    result = []
    for log in db_logs:
        sp_hash = None
        if log.system_prompt:
            sp_hash = "sha256:" + hashlib.sha256(log.system_prompt.encode()).hexdigest()[:16]
        result.append({
            "id": log.id,
            "session_id": log.session_id,
            "user_id": log.user_id,
            "user_message": log.user_message,
            "system_prompt_hash": sp_hash,
            "context_injected": log.context_injected,
            "llm_response": log.llm_response,
            "tools_called": log.tools_called,
            "attack_type": log.attack_type,
            "defense_active": log.defense_active,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        })
    return {"logs": result, "total": len(result)}


@router.delete("/logs")
def delete_logs(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth_module.require_admin),
):
    count = db.query(models.ChatLog).count()
    db.query(models.ChatLog).delete()
    db.commit()

    # Xóa JSONL files
    for f in LOGS_DIR.glob("chat_*.jsonl"):
        f.unlink()

    return {"message": f"Đã xóa {count} log records và các file JSONL."}
