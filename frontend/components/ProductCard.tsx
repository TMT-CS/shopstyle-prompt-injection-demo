"use client";
import Link from "next/link";
import { Product } from "@/lib/types";

const CAT_LABEL: Record<string, string> = {
  ao: "Áo",
  quan: "Quần",
  vay: "Váy & Đầm",
  phu_kien: "Phụ kiện",
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-[#111] border border-[#262626] rounded-lg overflow-hidden hover:border-[#333] hover:-translate-y-0.5 transition-all cursor-pointer">
        {/* Image */}
        <div className="w-full aspect-[3/4] bg-[#1a1a1a] flex items-center justify-center text-7xl border-b border-[#262626] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(255,255,255,0.03),transparent_70%)]" />
          <span className="relative z-10">{product.icon || "👕"}</span>
          {product.image_url && (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover z-20"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-[#737373] mb-1">
            {CAT_LABEL[product.category] || product.category}
          </div>
          <div className="text-[14px] font-semibold text-[#ededed] mb-2.5 leading-snug">
            {product.name}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold text-white">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            <span className="text-[11px] text-[#737373]">
              Còn {product.stock}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
