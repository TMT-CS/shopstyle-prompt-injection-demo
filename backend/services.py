"""
Service layer — logic nghiệp vụ dùng chung cho cả API router (routers/*.py)
và tool handler của LLM (llm/tools.py).

Mục tiêu kiến trúc: tool là 'adapter mỏng' TÁI SỬ DỤNG service, KHÔNG viết lại
logic. Router và tool cùng gọi vào đây → một chỗ sửa, cả hai cùng đổi (DRY).

Quy ước:
- Service KHÔNG tự xác thực. Caller chịu trách nhiệm truyền 'user' đã xác thực:
  router lấy qua Depends(get_current_user); chat lấy qua current_user của phiên.
  (Đây là lý do LLM chỉ thao tác được trên tài khoản của chính phiên đăng nhập.)
- Lỗi nghiệp vụ ném ServiceError; router map sang HTTPException, tool map sang
  chuỗi lỗi để trả lại cho mô hình.
"""
from sqlalchemy.orm import Session
import sqlalchemy

import models
import auth as auth_module


class ServiceError(Exception):
    """Lỗi nghiệp vụ (vi phạm ràng buộc dữ liệu) — không phải lỗi hệ thống."""


# ─────────────────────────── Tài khoản ───────────────────────────
def change_email(db: Session, user: models.User, new_email: str) -> str:
    existing = db.query(models.User).filter(models.User.email == new_email).first()
    if existing and existing.id != user.id:
        raise ServiceError("Email đã được sử dụng bởi tài khoản khác.")
    user.email = new_email
    db.commit()
    return f"Email đã được cập nhật thành {new_email}."


def reset_password(db: Session, user: models.User, new_password: str) -> str:
    if len(new_password) < 6:
        raise ServiceError("Mật khẩu tối thiểu 6 ký tự.")
    user.hashed_password = auth_module.hash_password(new_password)
    db.commit()
    return "Mật khẩu đã được đặt lại thành công."


def delete_account(db: Session, user: models.User) -> str:
    username = user.username
    db.delete(user)
    db.commit()
    return f"Tài khoản '{username}' đã bị xóa."


# ─────────────────────── Sản phẩm / bình luận ───────────────────────
def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def get_comments(db: Session, product_id: int):
    return (
        db.query(models.Comment)
        .filter(models.Comment.product_id == product_id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )


# ─────────────────────────── SQL thô ───────────────────────────
def run_raw_sql(db: Session, query: str, commit: bool = False):
    """Thực thi SQL thô.

    commit=True  -> dùng cho API admin (có ghi dữ liệu).
    commit=False -> dùng cho tool LLM (chỉ đọc; không ghi để hạn chế tác hại).
    """
    result = db.execute(sqlalchemy.text(query))
    if commit:
        db.commit()
    return result
