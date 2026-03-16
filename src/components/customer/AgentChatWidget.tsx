import { useState, useRef, useEffect } from "react";
import { Bot, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { useLocation } from "@/context/LocationContext";

// On native (Android/iOS) the proxy is unreachable — use the direct backend URL.
const AGENT_URL = Capacitor.isNativePlatform()
  ? (import.meta.env.VITE_AGENT_DIRECT_URL)
  : (import.meta.env.VITE_AGENT_URL);

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
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [userJwt, setUserJwt] = useState<string | null>(null);
  const { lat: userLat, lng: userLng } = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Track the Supabase JWT so the agent can access cart/wishlist for logged-in users
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserJwt(session?.access_token ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserJwt(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const speakFromServer = async (text: string) => {
    try {
      const res = await fetch(`${AGENT_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      if (currentAudioRef.current) currentAudioRef.current.pause();
      const audio = new Audio(URL.createObjectURL(blob));
      currentAudioRef.current = audio;
      audio.play();
    } catch { /* TTS failure is non-critical */ }
  };

  const toggleTTS = () => {
    setTtsEnabled((prev) => {
      if (prev && currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      return !prev;
    });
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        await transcribeAudio(audioBlob, recorder.mimeType);
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access denied or unavailable.");
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
    } else {
      startRecording();
    }
  };

  const transcribeAudio = async (audioBlob: Blob, mimeType: string) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording");
    // Send the MIME type so the backend knows the format
    const url = `${AGENT_URL}/transcribe`;
    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const data = await res.json();
      if (data.transcript) {
        // Auto-send the transcribed text
        setInput(data.transcript);
        // Use a callback pattern so sendMessage picks up the new value
        await sendMessageText(data.transcript);
      } else {
        setError("Could not understand the audio. Please try again.");
      }
    } catch {
      setError("Error transcribing audio.");
    } finally {
      setTranscribing(false);
    }
  };

  const sendMessageText = async (text: string) => {
    if (!text.trim() || sending) return;

    setInput("");
    setError(null);
    setSending(true);

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text, ts: getTime() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`${AGENT_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          user_jwt: userJwt,
          user_lat: userLat ?? undefined,
          user_lng: userLng ?? undefined,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      const reply = data.reply as string;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "agent", text: reply, ts: getTime() },
      ]);

      if (ttsEnabled) speakFromServer(reply);
    } catch (err) {
      setError("Could not reach the AI assistant. Make sure the agent server is running.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = () => sendMessageText(input.trim());

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
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    setSessionId(null);
    setMessages([]);
    setError(null);
  };

  return (
    <div>
      {open && (
        <div className="fixed bottom-12 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
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
                onClick={toggleTTS}
                title={ttsEnabled ? "Mute voice responses" : "Unmute voice responses"}
                className="text-white/60 hover:text-white p-1 rounded transition-colors"
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
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
            {(sending || transcribing) && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  {transcribing ? (
                    <span className="text-xs text-gray-400">Transcribing…</span>
                  ) : (
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <button
              onClick={toggleVoice}
              disabled={sending || transcribing}
              title={isRecording ? "Stop recording" : "Voice input"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }`}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <textarea
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none bg-gray-50 focus:border-orange-500 focus:bg-white transition-colors max-h-24"
              placeholder={transcribing ? "Transcribing…" : isRecording ? "Recording… tap mic to stop" : "e.g. What is available?"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={isRecording || transcribing}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending || isRecording || transcribing}
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
          className="fixed bottom-4 right-8 w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-orange-700 transition-all z-50"
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}
