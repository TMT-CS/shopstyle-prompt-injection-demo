"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-[rgba(10,10,10,0.85)] backdrop-blur-md border-b border-[#262626] flex items-center px-6 gap-6 z-50">
      {/* Logo */}
      <Link href="/" className="text-[15px] font-bold text-white tracking-tight shrink-0">
        ShopStyle
      </Link>

      {/* Nav links */}
      <div className="flex gap-1 flex-1">
        <Link href="/" className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors">
          Trang chủ
        </Link>
        <Link href="/?category=ao" className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors">
          Áo
        </Link>
        <Link href="/?category=quan" className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors">
          Quần
        </Link>
        <Link href="/?category=vay" className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors">
          Váy & Đầm
        </Link>
        <Link href="/?category=phu_kien" className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] transition-colors">
          Phụ kiện
        </Link>
      </div>

      {/* Auth */}
      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium text-[#ededed] border border-[#262626] hover:bg-[#1a1a1a] transition-colors"
            >
              {user.username} ▾
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-[#262626] rounded-lg overflow-hidden shadow-xl z-50 animate-fadein">
                <div className="px-3 py-2 border-b border-[#262626]">
                  <div className="text-[13px] font-semibold text-[#ededed]">{user.username}</div>
                  <div className="text-[11px] text-[#737373]">{user.email}</div>
                </div>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-[13px] text-[#ededed] hover:bg-[#1a1a1a] transition-colors"
                  >
                    ⚙ Quản trị
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-[13px] text-[#ef4444] hover:bg-[#1a1a1a] transition-colors"
                >
                  ← Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/auth/login" className="px-3 py-1.5 text-[13px] font-medium text-[#737373] hover:text-[#ededed] hover:bg-[#1a1a1a] rounded-md transition-colors">
              Đăng nhập
            </Link>
            <Link href="/auth/register" className="px-3 py-1.5 text-[13px] font-medium bg-white text-black rounded-md hover:bg-[#e5e5e5] transition-colors">
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
