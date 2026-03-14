import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, MessageSquare} from "lucide-react";

interface Message {
    id: string;
    consumer_id: string;
    supplier_id: string;
    sender: "customer" | "supplier";
    text: string;
    created_at: string;
}

function getTime(ts: string): string {
    return new Date(ts || Date.now()).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

// Check if a string is a valid UUID
function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export default function ChatWidget({supplierId}: {supplierId: string}) {
    const [open, setOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [hasUnread, setHasUnread] = useState<boolean>(false);
    const [consumerId, setConsumerId] = useState<string | null>(null);
    const [sending, setSending] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [supplierExists, setSupplierExists] = useState<boolean | null>(null);
    const [businessName, setBusinessName] = useState<string>("Support Team");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Verify supplier exists in database
    useEffect(() => {
        if (!supplierId || !isValidUUID(supplierId)) {
            setSupplierExists(false);
            return;
        }
        
        supabase
            .from("suppliers")
            .select("id, business_name")
            .eq("id", supplierId)
            .single()
            .then(({ data, error }) => {
                if (error || !data) {
                    console.error("Supplier not found:", error);
                    setSupplierExists(false);
                } else {
                    setSupplierExists(true);
                    setBusinessName(data.business_name || "Support Team");
                }
            });
    }, [supplierId]);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) =>{
            if (data?.user) {
                setConsumerId(data.user.id);
            } else {
                console.error("User not authenticated:", error);
                setConsumerId(null);
            }
        }).catch((err) => {
            console.error("Auth error:", err);
            setConsumerId(null);
        });
    }, []);

    useEffect(() => {
        if (!consumerId || !supplierId) return;

        supabase
            .from("messages")
            .select("*")
            .eq("consumer_id", consumerId)
            .eq("supplier_id", supplierId)
            .order("created_at", { ascending: true })
            .then(({ data }) => {if (data) setMessages(data as Message[]);});

        const channel = supabase
            .channel(`chat-${consumerId}-${supplierId}`)
            .on(
                "postgres_changes",
                {event: "INSERT", schema: "public", table: "messages", filter: `supplier_id=eq.${supplierId}`},
                (payload) => {
                    if (payload.new.consumer_id !== consumerId) return;
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Message];
                    });
                    if (payload.new.sender === "supplier" && !open) setHasUnread(true);
                }
            )
            .subscribe();
        
        return () => { supabase.removeChannel(channel);};
    }, [consumerId]);

    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const handleOpen = () => { setOpen(true), setHasUnread(false); };

    const sendMessage = async () => {
        // Check if supplier exists first
        if (supplierExists === false) {
            setError("This supplier no longer exists. Please refresh the page.");
            return;
        }
        
        // Validate supplier ID format
        if (!isValidUUID(supplierId)) {
            setError("Invalid supplier ID format. Please refresh the page.");
            return;
        }
        
        if (!input.trim() || !consumerId) {
            setError("Please log in to send messages");
            return;
        }
        setError(null);
        setSending(true);
        const text = input.trim();
        
        try {
            const { data, error: insertError } = await supabase.from("messages").insert({
                consumer_id: consumerId, 
                supplier_id: supplierId, 
                sender: "customer", 
                text
            }).select();
            
            if (insertError) {
                console.error("Failed to send message - full error:", JSON.stringify(insertError, null, 2));
                
                // Handle specific error codes
                if (insertError.code === '23503') {
                    // Foreign key violation - the supplier or user doesn't exist
                    if (insertError.details?.includes('users')) {
                        setError("Your account is not recognized. Please log out and log in again.");
                    } else if (insertError.details?.includes('suppliers')) {
                        setError("This supplier no longer exists or is unavailable.");
                    } else {
                        setError("Unable to send message. The recipient may no longer exist.");
                    }
                } else if (insertError.code === '23505') {
                    // Unique constraint violation
                    setError("Duplicate message detected. Please try again.");
                } else if (insertError.code === '409') {
                    setError("Server conflict. Please try refreshing the page.");
                } else if (insertError.message?.includes('row-level security')) {
                    setError("Permission denied. Please log in again.");
                } else {
                    setError("Failed to send message. Check console for details.");
                }
                // Restore the input if failed
                setInput(text);
            } else if (data && data.length > 0) {
                // Message sent successfully - use the actual data from the server
                setInput("");
                setMessages(prev => [...prev, data[0] as Message]);
            } else {
                // Server returned no error but also no data - this is unusual
                // Still clear input and add optimistically
                setInput("");
                const newMessage: Message = {
                    id: crypto.randomUUID(),
                    consumer_id: consumerId,
                    supplier_id: supplierId,
                    sender: "customer",
                    text: text,
                    created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message. Please try again.");
            setInput(text);
        } finally {
            setSending(false);
        }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {e.preventDefault(); sendMessage();}
    };

    return (
        <div>
      {open && (
        <div className="fixed bottom-12 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-blue-900 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">S</div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{businessName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/60 text-xs">Online · we'll reply shortly</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1 rounded transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                {error}
              </div>
            )}
            {messages.length === 0 && !error && <p className="text-center text-gray-400 text-sm my-auto">Send a message to start the conversation</p>}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === "customer" ? "flex-row-reverse" : ""}`}>
                {msg.sender === "supplier" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-blue-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">S</div>
                )}
                <div className={`flex flex-col ${msg.sender === "customer" ? "items-end" : ""}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === "customer" ? "bg-gray-900 text-white rounded-br-sm" : "bg-white text-gray-900 shadow-sm rounded-bl-sm"}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{getTime(msg.created_at)}</span>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none bg-gray-50 focus:border-gray-900 focus:bg-white transition-colors max-h-24"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending} className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-red-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
              {sending ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 pb-2 bg-white">We typically reply within a few minutes</p>
        </div>
      )}

      {!open && (
      <button onClick={handleOpen} className="fixed bottom-4 text-white right-8 w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50">
        <MessageSquare />
        {hasUnread && <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />}
      </button>
      )}
    </div>
    );
}
