"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { productsApi, commentsApi } from "@/lib/api";
import { Product, Comment } from "@/lib/types";
import CommentSection from "@/components/CommentSection";
import ChatBot from "@/components/ChatBot";

const CAT_LABEL: Record<string, string> = {
  ao: "Áo",
  quan: "Quần",
  vay: "Váy & Đầm",
  phu_kien: "Phụ kiện",
};

const SIZES: Record<string, string[]> = {
  ao: ["XS", "S", "M", "L", "XL", "XXL"],
  quan: ["S", "M", "L", "XL"],
  vay: ["XS", "S", "M", "L"],
  phu_kien: ["Free size"],
};

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const pid = Number(id);
    setLoading(true);
    Promise.all([
      productsApi.get(pid),
      commentsApi.list(pid),
    ])
      .then(([p, c]) => {
        setProduct(p);
        setComments(c);
      })
      .catch(() => router.push("/"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-[3/4] bg-[#111] rounded-xl border border-[#262626]" />
          <div className="space-y-4 pt-4">
            <div className="h-4 bg-[#111] rounded w-1/4" />
            <div className="h-8 bg-[#111] rounded w-3/4" />
            <div className="h-7 bg-[#111] rounded w-1/3" />
            <div className="h-20 bg-[#111] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const sizes = SIZES[product.category] || ["Free size"];

  const handleAddToCart = () => {
    if (!selectedSize && sizes[0] !== "Free size") return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSummary = async () => {
    if (!product) return;
    setSummaryLoading(true);
    setSummary("");
    try {
      const res = await productsApi.summary(product.id);
      setSummary(res.summary || "Chưa có đủ đánh giá để tóm tắt.");
    } catch {
      setSummary("Không thể tạo tóm tắt lúc này. Vui lòng thử lại sau.");
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-[#737373] mb-8">
          <Link href="/" className="hover:text-[#ededed] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href={`/?category=${product.category}`} className="hover:text-[#ededed] transition-colors">
            {CAT_LABEL[product.category]}
          </Link>
          <span>/</span>
          <span className="text-[#ededed]">{product.name}</span>
        </div>

        {/* Product layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-[3/4] bg-[#111] border border-[#262626] rounded-xl flex items-center justify-center text-[120px] sticky top-20 h-fit bg-[radial-gradient(circle_at_50%_55%,#1a1a1a,#111)] relative overflow-hidden">
            <span>{product.icon || "👕"}</span>
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#737373] mb-2">
                {CAT_LABEL[product.category]}
              </div>
              <h1 className="text-[28px] font-bold tracking-tight text-white leading-tight mb-3">
                {product.name}
              </h1>
              <div className="text-[26px] font-bold text-white">
                {product.price.toLocaleString("vi-VN")}₫
              </div>
            </div>

            <p className="text-[14px] text-[#a3a3a3] leading-relaxed">{product.description}</p>

            {/* Sizes */}
            <div>
              <div className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider mb-2">
                Kích thước
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-md border text-[13px] font-medium transition-all ${
                      selectedSize === s || s === "Free size"
                        ? "border-white bg-white text-black"
                        : "border-[#262626] text-[#ededed] hover:border-[#333] bg-transparent"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="text-[13px] text-[#737373]">
              Còn lại: <span className="text-[#ededed] font-medium">{product.stock} sản phẩm</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize && sizes[0] !== "Free size"}
                className="flex-1 py-3 bg-white text-black text-[14px] font-semibold rounded-md hover:bg-[#e5e5e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {addedToCart ? "✓ Đã thêm!" : "Thêm vào giỏ"}
              </button>
              <button className="flex-1 py-3 bg-transparent text-[#ededed] text-[14px] font-semibold rounded-md border border-[#262626] hover:bg-[#1a1a1a] hover:border-[#333] transition-colors">
                Mua ngay
              </button>
            </div>

            {/* Summary box — tóm tắt đánh giá bằng AI */}
            <div className="bg-[#111] border border-[#262626] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-semibold text-[#737373] uppercase tracking-wider">
                  Tóm tắt từ AI
                </div>
                <button
                  onClick={handleSummary}
                  disabled={summaryLoading}
                  className="text-[12px] font-medium text-[#3b82f6] hover:text-[#60a5fa] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {summaryLoading ? "Đang tóm tắt..." : "✨ Tóm tắt đánh giá"}
                </button>
              </div>
              {summary ? (
                <p className="text-[13px] text-[#a3a3a3] leading-relaxed whitespace-pre-wrap">{summary}</p>
              ) : (
                <p className="text-[12px] text-[#737373]">
                  Để AI đọc và tóm tắt nhanh các đánh giá của khách hàng về sản phẩm này.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments */}
        <CommentSection productId={product.id} initialComments={comments} />
      </div>

      <ChatBot productId={product.id} />
    </>
  );
}
