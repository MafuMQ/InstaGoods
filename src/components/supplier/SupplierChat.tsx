import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "../ui/card";
import { Send } from "lucide-react";

interface Message {
    id: string;
    consumer_id: string;
    supplier_id: string;
    sender: "customer" | "supplier";
    text: string;
    created_at: string;
}

interface Session {
    consumer_id: string;
    text: string;
    sender: string;
}

function getTime(ts: string): string {
    return new Date(ts).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

function shortId(id: string): string {
    return "Customer #" + id.slice(0, 6).toUpperCase
}

export default function SupplierChat({supplierId}: {supplierId: string | null}) {
    const [sessions, setSession] = useState<Session[]>([]);
    const [selectedSession, setSelectedSession] = useState<string | null> (null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [unread, setUnread] = useState<Record<string, boolean>>({});
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!supplierId) return;

        supabase
            .from("messages")
            .select("consumer_id, text, created_at, sender")
            .eq("supplier_id", supplierId)
            .order("created_at", {ascending: false})
            .then(({data}: {data: Session[] | null}) => {
                if (!data) return;
                const seen = new Set<string>();
                const unique: Session[] = [];
                for (const row of data) {
                    if (!seen.has(row.consumer_id)){
                        seen.add(row.consumer_id);
                        unique.push(row);
                    }
                }
                setSession(unique);
            });

        const channel = supabase
            .channel(`supplier-chat-${supplierId}`)
            .on(
                "postgres_changes",
                {event: "INSERT", schema: "public", table: "messages", filter: `supplier_id=eq.${supplierId}`},
                (payload: {new: Message}) => {
                    const msg = payload.new;
                    setSession((prev) => {
                        const exists = prev.find((s) => s.consumer_id === msg.consumer_id);
                        if (exists) return [{...exists, text: msg.text, sender: msg.sender}, ...prev.filter((s) => s.consumer_id !== msg.consumer_id)];
                        return [{consumer_id: msg.consumer_id, text: msg.text, sender: msg.sender}, ...prev];
                    });
                    setSelectedSession((current) => {
                        if (msg.sender === "customer" && msg.consumer_id !== current) setUnread((u) => ({...u, [msg.consumer_id]: true}));
                        if (msg.consumer_id === current) setMessages((prev) => prev.find((m) => m.id) ? prev: [...prev, msg]);
                        return current
                    });
                }
            )
            .subscribe();

        return () => {supabase.removeChannel(channel);};
    }, [supplierId]);

    useEffect(() => {
        if (!selectedSession || !supplierId) return;
        setMessages([]);
        setUnread((u) => ({...u, [selectedSession]: false}));
        supabase
            .from("messages")
            .select("*")
            .eq("consumer_id", selectedSession)
            .eq("supplier_id", supplierId)
            .order("created_at", {ascending: true})
            .then(({ data }) => { if (data) setMessages(data as Message[]); });
    }, [selectedSession, supplierId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const sendReply = async () => {
        if (!input.trim() || !selectedSession || !supplierId) return;
        const text = input.trim();
        setInput("");
        await supabase.from("messages").insert({
            consumer_id: selectedSession,
            supplier_id: supplierId,
            sender: "supplier",
            text,
        });
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {e.preventDefault(), sendReply};
    };

    return (
    <Card className="p-4 md:p-6 mt-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4">Customer Messages</h2>
      <div className="flex gap-4 h-[500px]">

        {/* Sessions list */}
        <div className="w-48 flex-shrink-0 border-r overflow-y-auto">
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center pt-6">No messages yet</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.consumer_id}
              onClick={() => setSelectedSession(s.consumer_id)}
              className={`flex items-center gap-2 p-3 cursor-pointer rounded-lg transition-colors ${selectedSession === s.consumer_id ? "bg-primary/10" : "hover:bg-muted"}`}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {s.consumer_id[0].toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium truncate">{shortId(s.consumer_id)}</p>
                <p className="text-xs text-muted-foreground truncate">{s.sender === "vendor" ? "You: " : ""}{s.text}</p>
              </div>
              {unread[s.consumer_id] && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
            </div>
          ))}
          </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Select a customer to view messages
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-3">
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm my-auto">No messages yet</p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "supplier" ? "flex-row-reverse" : ""}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === "supplier" ? "bg-primary text-white rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-muted-foreground">{getTime(msg.created_at)}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex gap-2 items-end pt-3 border-t">
                <textarea
                  className="flex-1 border border-input rounded-xl px-3 py-2 text-sm resize-none outline-none bg-background focus:border-primary transition-colors max-h-24"
                  placeholder="Type your reply..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                />
                <button
                  onClick={sendReply}
                  disabled={!input.trim()}
                  className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} color="white" />
                </button>
              </div>
            </>
            )}
        </div>
      </div>
    </Card>
  );
}