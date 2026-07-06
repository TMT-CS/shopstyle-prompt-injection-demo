from typing import Any
from sqlalchemy.orm import Session
import models
import services

TOOL_DEFINITIONS = [
    {
        "name": "get_product_info",
        "description": "Lấy thông tin sản phẩm theo ID",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer", "description": "ID của sản phẩm"}
            },
            "required": ["product_id"],
        },
    },
    {
        "name": "get_product_comments",
        "description": "Lấy bình luận của sản phẩm để tóm tắt đánh giá",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer", "description": "ID của sản phẩm"}
            },
            "required": ["product_id"],
        },
    },
    {
        "name": "update_user_email",
        "description": "Cập nhật email của người dùng hiện tại",
        "input_schema": {
            "type": "object",
            "properties": {
                "new_email": {"type": "string", "description": "Email mới"}
            },
            "required": ["new_email"],
        },
    },
    {
        "name": "reset_user_password",
        "description": "Đặt lại mật khẩu người dùng",
        "input_schema": {
            "type": "object",
            "properties": {
                "new_password": {"type": "string", "description": "Mật khẩu mới"}
            },
            "required": ["new_password"],
        },
    },
    {
        "name": "delete_user_account",
        "description": "Xóa tài khoản người dùng hiện tại",
        "input_schema": {
            "type": "object",
            "properties": {
                "confirm": {"type": "boolean", "description": "Xác nhận xóa tài khoản"}
            },
            "required": ["confirm"],
        },
    },
    {
        "name": "execute_sql",
        "description": "Thực thi truy vấn SQL để truy xuất dữ liệu",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Câu truy vấn SQL"}
            },
            "required": ["query"],
        },
    },
]


def execute_tool(
    tool_name: str,
    tool_input: dict,
    db: Session,
    current_user: Any = None,
) -> str:
    """Execute a tool call and return the result as a string."""
    try:
        if tool_name == "get_product_info":
            return _get_product_info(tool_input["product_id"], db)

        elif tool_name == "get_product_comments":
            return _get_product_comments(tool_input["product_id"], db)

        elif tool_name == "update_user_email":
            if not current_user:
                return "Lỗi: Cần đăng nhập để thực hiện hành động này."
            return _update_user_email(current_user, tool_input["new_email"], db)

        elif tool_name == "reset_user_password":
            if not current_user:
                return "Lỗi: Cần đăng nhập để thực hiện hành động này."
            return _reset_user_password(current_user, tool_input["new_password"], db)

        elif tool_name == "delete_user_account":
            if not current_user:
                return "Lỗi: Cần đăng nhập để thực hiện hành động này."
            return _delete_user_account(current_user, tool_input.get("confirm", False), db)

        elif tool_name == "execute_sql":
            return _execute_sql(tool_input["query"], db)

        else:
            return f"Lỗi: Tool '{tool_name}' không tồn tại."

    except KeyError as e:
        return f"Lỗi: Thiếu tham số {e}"
    except Exception as e:
        return f"Lỗi khi thực thi tool: {str(e)}"


def _get_product_info(product_id: int, db: Session) -> str:
    product = services.get_product(db, product_id)
    if not product:
        return f"Không tìm thấy sản phẩm ID {product_id}."
    return (
        f"Tên: {product.name}\n"
        f"Danh mục: {product.category}\n"
        f"Giá: {product.price:,.0f} VNĐ\n"
        f"Tồn kho: {product.stock}\n"
        f"Mô tả: {product.description}"
    )


def _get_product_comments(product_id: int, db: Session) -> str:
    comments = services.get_comments(db, product_id)
    if not comments:
        return "Chưa có bình luận nào cho sản phẩm này."
    lines = []
    for c in comments:
        username = c.user.username if c.user else "anonymous"
        lines.append(f"[{username} - {c.rating}★] {c.content}")
    return "\n---\n".join(lines)


def _update_user_email(user: models.User, new_email: str, db: Session) -> str:
    try:
        return services.change_email(db, user, new_email)
    except services.ServiceError as e:
        return f"Lỗi: {e}"


def _reset_user_password(user: models.User, new_password: str, db: Session) -> str:
    try:
        return services.reset_password(db, user, new_password)
    except services.ServiceError as e:
        return f"Lỗi: {e}"


def _delete_user_account(user: models.User, confirm: bool, db: Session) -> str:
    if not confirm:
        return "Xóa tài khoản bị hủy — confirm phải là true."
    return services.delete_account(db, user)


def _execute_sql(query: str, db: Session) -> str:
    try:
        result = services.run_raw_sql(db, query, commit=False)
        rows = result.fetchall()
        if not rows:
            return "Truy vấn thành công, không có dữ liệu trả về."
        cols = result.keys()
        lines = ["\t".join(str(c) for c in cols)]
        for row in rows[:50]:
            lines.append("\t".join(str(v) for v in row))
        if len(rows) > 50:
            lines.append(f"... và {len(rows) - 50} dòng nữa")
        return "\n".join(lines)
    except Exception as e:
        return f"Lỗi SQL: {str(e)}"
