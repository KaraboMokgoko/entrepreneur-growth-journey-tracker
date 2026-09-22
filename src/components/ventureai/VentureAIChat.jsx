import { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, X, Send } from "lucide-react";
import MessageBubble from "@/components/ventureai/MessageBubble";

const AGENT_NAME = "ventureAI";

const SUGGESTIONS = [
  "How is my enterprise doing?",
  "What are my priority gaps?",
  "What should I do to become funding ready?",
  "Summarise my latest mentorship session.",
];

export default function VentureAIChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef(null);

  const ensureConversation = async () => {
    if (loaded) return;
    setLoaded(true);
    try {
      const convs = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      const existing = Array.isArray(convs) ? convs[0] : null;
      if (existing) {
        setConversation(existing);
        setMessages(existing.messages || []);
      } else {
        const conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: "VentureAI", description: "Growth journey assistant" },
        });
        setConversation(conv);
        setMessages([]);
      }
    } catch {
      setLoaded(false);
    }
  };

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setBusy(false);
    });
    return unsubscribe;
  }, [conversation?.id]);

  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open]);

  useEffect(() => {
    if (open) ensureConversation();
  }, [open, user?.id]);

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || !conversation) return;
    setInput("");
    setBusy(true);
    try {
      await base44.agents.addMessage(conversation, { role: "user", content });
    } catch {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        VentureAI
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[70vh] max-h-[640px] w-[calc(100vw-3rem)] max-w-md flex-col overflow-hidden rounded-xl border bg-slate-50 shadow-xl">
      <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <p className="text-sm font-semibold leading-tight">VentureAI</p>
            <p className="text-[11px] leading-tight opacity-80">Your growth journey assistant</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && !busy && (
          <div className="space-y-2 pt-4">
            <p className="text-center text-sm text-muted-foreground">Ask me anything about your growth journey.</p>
            <div className="grid gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-lg border bg-white px-3 py-2 text-left text-xs shadow-sm hover:border-primary/40 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <MessageBubble key={idx} message={m} />
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              VentureAI is thinking…
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="flex items-center gap-2 border-t bg-white p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask VentureAI…"
          className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button type="submit" disabled={!input.trim() || busy || !conversation} className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}