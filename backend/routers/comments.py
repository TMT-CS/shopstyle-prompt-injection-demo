from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas
import auth as auth_module

router = APIRouter(prefix="/api/products", tags=["comments"])


@router.get("/{product_id}/comments", response_model=List[schemas.CommentOut])
def get_comments(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại.")
    comments = (
        db.query(models.Comment)
        .filter(models.Comment.product_id == product_id)
        .order_by(models.Comment.created_at.desc())
        .all()
    )
    result = []
    for c in comments:
        out = schemas.CommentOut.model_validate(c)
        out.username = c.user.username if c.user else "anonymous"
        result.append(out)
    return result


@router.post("/{product_id}/comments", response_model=schemas.CommentOut)
def add_comment(
    product_id: int,
    body: schemas.CommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Sản phẩm không tồn tại.")
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(status_code=400, detail="Rating phải từ 1 đến 5.")
    comment = models.Comment(
        product_id=product_id,
        user_id=current_user.id,
        content=body.content,
        rating=body.rating,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    out = schemas.CommentOut.model_validate(comment)
    out.username = current_user.username
    return out
