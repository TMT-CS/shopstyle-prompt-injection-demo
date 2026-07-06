"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { productsApi } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import ChatBot from "@/components/ChatBot";
import { Suspense } from "react";

const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "ao", label: "Áo" },
  { key: "quan", label: "Quần" },
  { key: "vay", label: "Váy & Đầm" },
  { key: "phu_kien", label: "Phụ kiện" },
];

function HomeContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    setActiveCategory(cat);
    fetchProducts(cat);
  }, [searchParams]);

  const fetchProducts = async (cat: string) => {
    setLoading(true);
    try {
      const data = await productsApi.list(cat === "all" ? undefined : cat);
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    fetchProducts(cat);
    const url = cat === "all" ? "/" : `/?category=${cat}`;
    window.history.pushState({}, "", url);
  };

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#262626]">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "linear-gradient(#262626 1px,transparent 1px),linear-gradient(90deg,#262626 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center py-20 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#262626] text-[11px] text-[#737373] mb-6 bg-[rgba(10,10,10,0.6)] backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse-dot" />
            Bộ sưu tập mới 2026
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white mb-5 leading-tight" style={{ letterSpacing: "-2px" }}>
            ShopStyle
          </h1>
          <p className="text-[15px] text-[#737373] mb-9 leading-relaxed">
            Thời trang tối giản, phong cách riêng. Khám phá bộ sưu tập mới nhất từ ShopStyle.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => handleCategory("all")}
              className="px-5 py-2.5 bg-white text-black text-[14px] font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
            >
              Mua sắm ngay
            </button>
            <button
              onClick={() => handleCategory("phu_kien")}
              className="px-5 py-2.5 bg-transparent text-[#ededed] text-[14px] font-medium rounded-md border border-[#262626] hover:bg-[#1a1a1a] hover:border-[#333] transition-colors"
            >
              Phụ kiện mới
            </button>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="max-w-[1200px] mx-auto px-6 mt-8 mb-2">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => handleCategory(c.key)}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all border ${
                activeCategory === c.key
                  ? "text-[#ededed] bg-[#111] border-[#262626]"
                  : "text-[#737373] border-transparent hover:text-[#ededed] hover:bg-[#1a1a1a]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-semibold">
            {CATEGORIES.find((c) => c.key === activeCategory)?.label || "Tất cả sản phẩm"}
          </h2>
          <span className="text-[13px] text-[#737373]">{products.length} sản phẩm</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#111] border border-[#262626] rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-[#1a1a1a]" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 bg-[#1a1a1a] rounded w-1/3" />
                  <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
                  <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <ChatBot />
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
