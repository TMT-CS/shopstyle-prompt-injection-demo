// Gọi thẳng backend (NEXT_PUBLIC_API_URL=http://localhost:8000) thay vì qua Next dev proxy.
// Lý do: rewrite proxy của Next dev server có timeout 30s; đòn LLM chậm (>30s, ví dụ SP3 dump bảng)
// bị proxy cắt -> trả 500 "Internal Server Error" dù backend vẫn chạy xong. Gọi thẳng :8000 (CORS
// đã cho phép localhost:3000) không bị giới hạn này. Fallback "" = qua proxy nếu thiếu env.
const API = process.env.NEXT_PUBLIC_API_URL || "";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    // 401 = phiên không còn hợp lệ (token hết hạn hoặc tài khoản đã bị xóa) -> tự đăng xuất.
    // Bỏ qua endpoint đăng nhập/đăng ký để không phá thông báo lỗi sai mật khẩu.
    const isAuthEndpoint = path.includes("/api/auth/login") || path.includes("/api/auth/register");
    if (res.status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/auth/")) {
        window.location.href = "/auth/login";
      }
    }
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    request<{ access_token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, email: string, password: string) =>
    request<any>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  me: () => request<any>("/api/auth/me"),
};

// Products
export const productsApi = {
  list: (category?: string) =>
    request<any[]>(`/api/products${category ? `?category=${category}` : ""}`),
  get: (id: number) => request<any>(`/api/products/${id}`),
  summary: (id: number) => request<any>(`/api/products/${id}/summary`),
};

// Comments
export const commentsApi = {
  list: (productId: number) =>
    request<any[]>(`/api/products/${productId}/comments`),
  create: (productId: number, content: string, rating: number) =>
    request<any>(`/api/products/${productId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, rating }),
    }),
};

// Chat
export const chatApi = {
  send: (message: string, session_id: string, product_id?: number) =>
    request<any>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id, product_id }),
    }),
};

// User
export const userApi = {
  updateEmail: (new_email: string) =>
    request<any>("/api/users/me/email", {
      method: "PUT",
      body: JSON.stringify({ new_email }),
    }),
  resetPassword: (new_password: string) =>
    request<any>("/api/users/me/reset-password", {
      method: "POST",
      body: JSON.stringify({ new_password }),
    }),
  deleteAccount: () =>
    request<any>("/api/users/me", { method: "DELETE" }),
};

// Admin
export const adminApi = {
  getLogs: () => request<any>("/api/admin/logs"),
  deleteLogs: () => request<any>("/api/admin/logs", { method: "DELETE" }),
  executeSQL: (query: string) =>
    request<any>("/api/admin/execute-sql", {
      method: "POST",
      body: JSON.stringify({ query }),
    }),
};
