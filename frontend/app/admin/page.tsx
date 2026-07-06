"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { ChatLog } from "@/lib/types";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users");
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlLoading, setSqlLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;                 // chờ auth-context nạp xong từ localStorage
    if (!user) { router.push("/auth/login"); return; }
    if (user.role !== "admin") { router.push("/"); return; }
    fetchLogs();
  }, [user, authLoading]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs();
      setLogs(res.logs || []);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  const handleDeleteLogs = async () => {
    if (!confirm("Xóa toàn bộ log?")) return;
    await adminApi.deleteLogs();
    setLogs([]);
  };

  const handleSQL = async (e: React.FormEvent) => {
    e.preventDefault();
    setSqlLoading(true);
    setSqlResult(null);
    try {
      const res = await adminApi.executeSQL(sqlQuery);
      setSqlResult(res);
    } catch (err: any) {
      setSqlResult({ error: err.message });
    } finally {
      setSqlLoading(false);
    }
  };

  // Chưa xác thực xong hoặc không phải admin → không render UI quản trị (tránh nháy nội dung)
  if (authLoading || !user || user.role !== "admin") {
    return <div className="max-w-[1200px] mx-auto px-6 py-8 text-[13px] text-[#737373]">Đang tải...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-bold">Admin Dashboard</h1>
          <p className="text-[13px] text-[#737373] mt-0.5">Quản lý hệ thống · ShopStyle</p>
        </div>
        <button
          onClick={handleDeleteLogs}
          className="px-3 py-1.5 text-[12px] text-[#ef4444] border border-[#ef4444]/30 rounded-md hover:bg-[rgba(239,68,68,0.05)] transition-colors"
        >
          Xóa log
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div className="bg-[#111] border border-[#262626] rounded-lg p-4 inline-block min-w-[200px]">
          <div className="text-[26px] font-bold text-white">{logs.length}</div>
          <div className="text-[12px] text-[#737373] mt-0.5">Tổng requests</div>
        </div>
      </div>

      {/* SQL executor */}
      <div className="bg-[#111] border border-[#262626] rounded-lg p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-[14px] font-semibold">Execute SQL</h2>
        </div>
        <form onSubmit={handleSQL} className="flex gap-2">
          <input
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-md text-[12px] font-mono text-[#ededed] outline-none focus:border-[#333] transition-colors"
          />
          <button
            type="submit"
            disabled={sqlLoading}
            className="px-4 py-2 bg-white text-black text-[12px] font-medium rounded-md hover:bg-[#e5e5e5] disabled:opacity-50 transition-colors shrink-0"
          >
            {sqlLoading ? "..." : "Run"}
          </button>
        </form>
        {sqlResult && (
          <div className="mt-3 p-3 bg-[#0a0a0a] border border-[#262626] rounded-md overflow-auto max-h-48">
            {sqlResult.error ? (
              <p className="text-[12px] text-[#ef4444] font-mono">{sqlResult.error}</p>
            ) : sqlResult.rows ? (
              <table className="text-[11px] font-mono w-full">
                <thead>
                  <tr className="border-b border-[#262626]">
                    {sqlResult.columns?.map((c: string) => (
                      <th key={c} className="text-left px-2 py-1 text-[#737373] font-medium">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sqlResult.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-[#262626]/50">
                      {sqlResult.columns?.map((c: string) => (
                        <td key={c} className="px-2 py-1 text-[#a3a3a3] max-w-[200px] truncate">{String(row[c] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[12px] text-[#737373] font-mono">{JSON.stringify(sqlResult)}</p>
            )}
          </div>
        )}
      </div>

      {/* Log table */}
      <div className="bg-[#111] border border-[#262626] rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Chat Logs</h2>
          <button onClick={fetchLogs} className="text-[12px] text-[#737373] hover:text-[#ededed] transition-colors">
            Làm mới
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[13px] text-[#737373]">Đang tải...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-[#737373]">Chưa có log nào. Gửi tin nhắn cho chatbot để tạo log.</div>
        ) : (
          <div className="divide-y divide-[#262626]">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3.5">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-mono text-[#737373]">
                        {new Date(log.timestamp).toLocaleString("vi-VN")}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${log.defense_active ? "text-[#22c55e] bg-[rgba(34,197,94,0.1)] border-[#22c55e]/30" : "text-[#737373] border-[#262626]"}`}>
                        {log.defense_active ? "defense: on" : "defense: off"}
                      </span>
                      {log.tools_called?.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border text-[#737373] border-[#262626] font-mono">
                          {log.tools_called.map((t: any) => t.name).join(", ")}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#ededed] font-mono truncate">
                      <span className="text-[#737373]">user: </span>{log.user_message}
                    </p>
                  </div>
                  <span className="text-[#737373] text-[11px] shrink-0">{expanded === log.id ? "▲" : "▼"}</span>
                </div>
                {expanded === log.id && (
                  <div className="mt-3 space-y-2 pl-0 animate-fadein">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#737373]">
                      <span>defense_active: <span className={log.defense_active ? "text-[#22c55e]" : "text-[#ef4444]"}>{String(!!log.defense_active)}</span></span>
                      {log.system_prompt_hash && <span>prompt: {log.system_prompt_hash}</span>}
                    </div>
                    <div className="p-3 bg-[#0a0a0a] rounded-md border border-[#262626]">
                      <div className="text-[10px] text-[#737373] font-mono mb-1">LLM RESPONSE</div>
                      <p className="text-[12px] font-mono text-[#a3a3a3] whitespace-pre-wrap">{log.llm_response}</p>
                    </div>
                    {log.context_injected && (
                      <div className="p-3 bg-[#0a0a0a] rounded-md border border-[#262626]">
                        <div className="text-[10px] text-[#737373] font-mono mb-1">CONTEXT INJECTED (verify Indirect Injection)</div>
                        <pre className="text-[11px] font-mono text-[#a3a3a3] whitespace-pre-wrap break-words max-h-48 overflow-auto">{log.context_injected}</pre>
                      </div>
                    )}
                    {log.tools_called?.length > 0 && (
                      <div className="p-3 bg-[#0a0a0a] rounded-md border border-[#262626]">
                        <div className="text-[10px] text-[#737373] font-mono mb-1">TOOLS CALLED</div>
                        <pre className="text-[11px] font-mono text-[#a3a3a3]">{JSON.stringify(log.tools_called, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
