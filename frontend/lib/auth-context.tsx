"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types";
import { authApi } from "./api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  // true cho tới khi đọc xong user từ localStorage — tránh redirect nhầm khi chưa hydrate
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      // Hiển thị ngay từ cache cho mượt, đồng thời xác thực lại với backend.
      try { setUserState(JSON.parse(stored)); } catch {}
      authApi.me()
        .then((u) => { setUserState(u); localStorage.setItem("user", JSON.stringify(u)); })
        .catch(() => {
          // Tài khoản đã bị xóa / token hết hạn -> dọn phiên (api.ts đã lo điều hướng về login).
          setUserState(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
