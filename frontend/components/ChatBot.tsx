"use client";
import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

const SESSION_ID = "sess_" + Math.random().toString(36).slice(2, 9);

function formatTime(date: Date) {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatBot({ productId }: { productId?: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "Xin chào! Tôi là trợ lý ShopStyle. Hỏi tôi về sản phẩm nhé! 👋",
      time: formatTime(new Date()),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: ChatMessage = { role: "user", text: msg, time: formatTime(new Date()) };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await chatApi.send(msg, SESSION_ID, productId);
      const botMsg: ChatMessage = {
        role: "bot",
        text: res.response,
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: `⚠ Lỗi: ${err.message}`, time: formatTime(new Date()) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-13 h-13 rounded-full bg-white text-black flex items-center justify-center z-50 shadow-2xl hover:scale-105 transition-transform text-xl"
        style={{ width: 52, height: 52 }}
        title="Mở chatbot"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-6 w-[376px] h-[540px] bg-[#111] border border-[#262626] rounded-xl flex flex-col z-50 shadow-2xl transition-all duration-200 ${
          open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-y-3 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-[#262626] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center text-[15px]">
            🤖
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">ShopStyle AI</div>
            <div className="text-[11px] text-[#22c55e]">● Online</div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col gap-1 max-w-[88%] ${m.role === "user" ? "self-end items-end" : "self-start"}`}>
              <div
                className={`px-3 py-2 rounded-lg text-[12px] leading-snug break-words font-mono whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-white text-black rounded-br-sm"
                    : "bg-[#1a1a1a] border border-[#262626] rounded-bl-sm text-[#ededed]"
                }`}
              >
                {m.text}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-[#737373] font-sans">{m.time}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start bg-[#1a1a1a] border border-[#262626] rounded-lg rounded-bl-sm p-3 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#737373] animate-bounce-dot"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          )}
          <div ref={msgsEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#262626] flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-[#1a1a1a] border border-[#262626] rounded-md px-3 py-2 text-[12px] font-mono text-[#ededed] placeholder-[#737373] outline-none focus:border-[#333] resize-none max-h-20 transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-md bg-white text-black flex items-center justify-center shrink-0 self-end hover:bg-[#e5e5e5] disabled:bg-[#1a1a1a] disabled:text-[#737373] disabled:cursor-not-allowed transition-colors text-[13px]"
          >
            ↑
          </button>
        </div>
      </div>
    </>
  );
}
