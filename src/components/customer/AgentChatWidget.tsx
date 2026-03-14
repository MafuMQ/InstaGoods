import { useState, useRef, useEffect } from "react";
import { Bot } from "lucide-react";

const AGENT_URL = import.meta.env.VITE_AGENT_URL || "http://localhost:5000";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: string;
}

function getTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AgentChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setError(null);
    setSending(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text, ts: getTime() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${AGENT_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "agent", text: data.reply, ts: getTime() },
      ]);
    } catch (err) {
      setError("Could not reach the AI assistant. Make sure the agent server is running.");
      // Remove the optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    if (sessionId) {
      fetch(`${AGENT_URL}/session/${sessionId}`, { method: "DELETE" }).catch(() => {});
    }
    setSessionId(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div>
      {open && (
        <div className="fixed bottom-12 left-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="bg-orange-600 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-800 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">InstaGoods AI</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-300" />
                <span className="text-white/70 text-xs">Shopping assistant</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Clear conversation"
                className="text-white/60 hover:text-white p-1 rounded transition-colors text-xs"
              >
                ↺
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                {error}
              </div>
            )}
            {messages.length === 0 && !error && (
              <p className="text-center text-gray-400 text-sm my-auto">
                Ask me anything about products, categories, or pricing!
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "agent" && (
                  <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div className={`flex flex-col ${msg.role === "user" ? "items-end" : ""}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{msg.ts}</span>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none bg-gray-50 focus:border-orange-500 focus:bg-white transition-colors max-h-24"
              placeholder="e.g. Show me bread under R50…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sending ? (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 pb-2 bg-white">Powered by Gemini · InstaGoods AI</p>
        </div>
      )}

      {/* FAB trigger — bottom-left to avoid overlap with supplier chat (bottom-right) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Chat with AI shopping assistant"
          className="fixed bottom-4 left-8 w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-orange-700 transition-all z-50"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
