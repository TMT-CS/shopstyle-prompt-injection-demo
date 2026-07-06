"""Khôi phục cơ sở dữ liệu về trạng thái seed ban đầu.

Dùng giữa các đợt thực nghiệm khi kịch bản đã làm hỏng dữ liệu (xóa tài khoản,
đổi email/mật khẩu user1, v.v.) nhưng đợt tiếp theo cần dữ liệu gốc.

Mặc định GIỮ LẠI chat_logs (bằng chứng thực nghiệm). Thêm cờ --logs để xóa luôn log.

Chạy:
    cd backend
    python reset_db.py            # khôi phục users/products/comments, giữ log
    python reset_db.py --logs     # khôi phục tất cả + xóa sạch chat_logs

Lưu ý: nên chạy khi chatbot đang rảnh (không có request chạy dở) để tránh khóa SQLite.
Sau khi reset, hãy đăng nhập lại (token cũ trong trình duyệt trỏ tới id tài khoản cũ).
"""
import sys
from sqlalchemy import text
from database import SessionLocal, engine, Base
import models
import seed


def reset(wipe_logs: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Xóa con trước (comments tham chiếu users/products) rồi tới users/products
        db.query(models.Comment).delete()
        db.query(models.User).delete()
        db.query(models.Product).delete()
        if wipe_logs:
            db.query(models.ChatLog).delete()
        # Reset bộ đếm autoincrement để id quay lại từ 1 (products dùng id cố định nên không ảnh hưởng)
        try:
            db.execute(text("DELETE FROM sqlite_sequence"))
        except Exception:
            pass
        db.commit()
    finally:
        db.close()

    # seed.seed() có chốt "đã seed thì bỏ qua"; vì vừa xóa sạch users nên nó sẽ chạy lại đầy đủ
    seed.seed()
    print("Reset OK. Tai khoan goc: admin/admin123, user1/user123"
          + ("  (da xoa chat_logs)" if wipe_logs else "  (giu nguyen chat_logs)"))


if __name__ == "__main__":
    reset(wipe_logs="--logs" in sys.argv)
