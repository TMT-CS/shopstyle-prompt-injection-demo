from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth as auth_module
import services

router = APIRouter(prefix="/api/users", tags=["users"])


@router.put("/me/email")
def update_email(
    body: schemas.EmailUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user),
):
    try:
        msg = services.change_email(db, current_user, body.new_email)
    except services.ServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": msg}


@router.post("/me/reset-password")
def reset_password(
    body: schemas.PasswordReset,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user),
):
    try:
        msg = services.reset_password(db, current_user, body.new_password)
    except services.ServiceError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": msg}


@router.delete("/me")
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user),
):
    msg = services.delete_account(db, current_user)
    return {"message": msg}
