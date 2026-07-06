"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError("Vui lòng nhập đầy đủ thông tin."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem("token", res.access_token);
      setUser(res.user);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Sai thông tin đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-[15px] font-bold text-white">ShopStyle</Link>
          <h1 className="text-[22px] font-bold mt-4 mb-1">Đăng nhập</h1>
          <p className="text-[13px] text-[#737373]">Chào mừng trở lại</p>
        </div>

        <div className="bg-[#111] border border-[#262626] rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-md text-[13px] text-[#ededed] placeholder-[#737373] outline-none focus:border-[#333] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-md text-[13px] text-[#ededed] placeholder-[#737373] outline-none focus:border-[#333] transition-colors"
              />
            </div>

            {error && (
              <div className="text-[12px] text-[#ef4444] bg-[rgba(239,68,68,0.05)] border border-[#ef4444]/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-white text-black text-[13px] font-semibold rounded-md hover:bg-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#737373] mt-5">
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="text-[#ededed] hover:text-white transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
