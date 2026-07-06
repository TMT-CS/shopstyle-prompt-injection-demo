import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ShopStyle — Thời trang tối giản",
  description: "Cửa hàng thời trang trực tuyến ShopStyle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-[#ededed] font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="pt-14 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
