"use client";
import { useState } from "react";
import { Comment } from "@/lib/types";
import { commentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-[11px]">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-[11px] font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function CommentSection({
  productId,
  initialComments,
}: {
  productId: number;
  initialComments: Comment[];
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const newComment = await commentsApi.create(productId, content, rating);
      setComments([newComment, ...comments]);
      setContent("");
      setRating(5);
    } catch (err: any) {
      setError(err.message || "Đăng bình luận thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-[17px] font-semibold mb-5">
        Đánh giá ({comments.length})
      </h2>

      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-[#111] border border-[#262626] rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar name={c.username || "U"} />
                <div>
                  <span className="text-[13px] font-semibold">{c.username}</span>
                  <div className="text-[11px] text-[#737373]">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
              <Stars rating={c.rating} />
            </div>
            <p className="text-[13px] text-[#a3a3a3] leading-relaxed whitespace-pre-wrap break-words">
              {c.content}
            </p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-[#737373] text-[13px] py-4">Chưa có đánh giá nào.</p>
        )}
      </div>

      {/* Add comment */}
      {user ? (
        <form onSubmit={handleSubmit} className="mt-6 bg-[#111] border border-[#262626] rounded-lg p-5">
          <h3 className="text-[14px] font-semibold mb-4">Viết đánh giá</h3>
          <div className="mb-3">
            <label className="block text-[12px] font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
              Số sao
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`text-xl transition-colors ${s <= rating ? "text-yellow-400" : "text-[#262626]"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[12px] font-semibold text-[#737373] uppercase tracking-wide mb-1.5">
              Nội dung
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-md text-[13px] text-[#ededed] placeholder-[#737373] outline-none focus:border-[#333] resize-none transition-colors"
            />
          </div>
          {error && <p className="text-[12px] text-[#ef4444] mb-3">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Đang gửi..." : "Đăng đánh giá"}
          </button>
        </form>
      ) : (
        <div className="mt-5 text-[13px] text-[#737373]">
          <a href="/auth/login" className="text-[#3b82f6] hover:underline">Đăng nhập</a> để viết đánh giá.
        </div>
      )}
    </div>
  );
}
