"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.register(form.username, form.email, form.password);
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setError(err.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-[15px] font-bold text-white">ShopStyle</Link>
          <h1 className="text-[22px] font-bold mt-4 mb-1">Tạo tài khoản</h1>
          <p className="text-[13px] text-[#737373]">Đăng ký miễn phí</p>
        </div>

        <div className="bg-[#111] border border-[#262626] rounded-xl p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="text-[#22c55e] text-3xl mb-3">✓</div>
              <div className="text-[14px] font-semibold mb-1">Đăng ký thành công!</div>
              <div className="text-[12px] text-[#737373]">Đang chuyển đến trang đăng nhập...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {[
                { key: "username", label: "Tên đăng nhập", type: "text", ph: "shopstyle_user" },
                { key: "email", label: "Email", type: "email", ph: "you@example.com" },
                { key: "password", label: "Mật khẩu", type: "password", ph: "Tối thiểu 6 ký tự" },
              ].map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className="block text-[12px] font-semibold text-[#737373] uppercase tracking-wider mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={update(key)}
                    placeholder={ph}
                    className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-md text-[13px] text-[#ededed] placeholder-[#737373] outline-none focus:border-[#333] transition-colors"
                  />
                </div>
              ))}

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
                {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-[#737373] mt-5">
          Đã có tài khoản?{" "}
          <Link href="/auth/login" className="text-[#ededed] hover:text-white transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
