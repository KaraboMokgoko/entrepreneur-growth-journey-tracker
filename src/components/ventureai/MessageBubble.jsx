import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, XCircle } from "lucide-react";

const STATUS_META = {
  pending: { label: "Pending", Icon: Loader2, spin: true },
  running: { label: "Running", Icon: Loader2, spin: true },
  in_progress: { label: "In progress", Icon: Loader2, spin: true },
  completed: { label: "Completed", Icon: CheckCircle2, spin: false },
  success: { label: "Done", Icon: CheckCircle2, spin: false },
  failed: { label: "Failed", Icon: XCircle, spin: false },
  error: { label: "Error", Icon: XCircle, spin: false },
};

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const projection = toolCall.display_projection || {};
  const meta = STATUS_META[toolCall.status] || STATUS_META.pending;
  const { Icon, label, spin } = meta;
  const failed = ["failed", "error"].includes(toolCall.status);

  if (projection.hide_details && projection.details_redacted) {
    const text = failed ? projection.error_label || label
      : spin ? projection.active_label || label : projection.label || label;
    return (
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />
        <span>{text}</span>
      </div>
    );
  }

  let parsedArgs = toolCall.arguments_string;
  try { parsedArgs = JSON.parse(toolCall.arguments_string); } catch { /* keep raw */ }
  let parsedResults = toolCall.results;
  try { parsedResults = JSON.parse(toolCall.results); } catch { /* keep raw */ }

  return (
    <div className="mt-1.5 text-xs">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : failed ? "text-destructive" : "text-emerald-600"}`} />
        <span>{toolCall.name}</span>
        <span className={failed ? "text-destructive" : ""}>{label}</span>
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {expanded && (
        <div className="mt-1 space-y-1 rounded-md bg-muted/60 p-2 font-mono text-[11px] break-words">
          <div>Parameters: {JSON.stringify(parsedArgs, null, 1)}</div>
          <div>Result: {JSON.stringify(parsedResults, null, 1)}</div>
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
        isUser ? "bg-primary text-primary-foreground" : "bg-white border shadow-sm"
      }`}>
        {message.content && (isUser
          ? <p className="whitespace-pre-wrap">{message.content}</p>
          : <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-semibold"><ReactMarkdown>{message.content}</ReactMarkdown></div>
        )}
        {message.tool_calls?.map((toolCall, idx) => (
          <ToolCallDisplay key={idx} toolCall={toolCall} />
        ))}
      </div>
    </div>
  );
}