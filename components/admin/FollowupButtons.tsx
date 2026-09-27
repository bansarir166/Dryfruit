"use client";

import { useState } from "react";
import { Mail, Check, Loader2, Send } from "lucide-react";

export function FollowupLeadButton({
  email,
  id,
  followedUpAt,
}: {
  email: string;
  id?: string;
  followedUpAt?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    followedUpAt ? "success" : "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/lead/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, id }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded border border-emerald-300">
          <Check className="h-3 w-3" />
          Follow-up Sent
        </span>
        <button
          type="button"
          onClick={handleSend}
          className="text-[9px] uppercase tracking-wider text-muted hover:underline"
        >
          Send Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSend}
        disabled={status === "loading"}
        className="inline-flex items-center gap-1.5 rounded bg-espresso px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-ivory transition-all hover:bg-espresso/90 hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-3 w-3" />
            Send Follow-up
          </>
        )}
      </button>
      {status === "error" && (
        <p className="mt-1 text-[10px] text-red-600 font-sans">{errorMsg}</p>
      )}
    </div>
  );
}

export function FollowupAllButton({ uncontactedCount }: { uncontactedCount: number }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSendAll() {
    if (!confirm(`Are you sure you want to dispatch personalized follow-up emails to ${uncontactedCount} leads right now?`)) {
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/lead/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(`✅ Successfully sent ${data.summary?.sent ?? 0} follow-up emails!`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult(`❌ Failed to send follow-ups: ${data.error || "Unknown error"}`);
      }
    } catch {
      setResult("❌ Network error while sending follow-ups.");
    } finally {
      setLoading(false);
    }
  }

  if (uncontactedCount === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSendAll}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded bg-amber-900 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-ivory transition-all hover:bg-amber-950 hover:-translate-y-0.5 disabled:opacity-60 shadow-sm"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Dispatching Emails...
          </>
        ) : (
          <>
            <Mail className="h-3.5 w-3.5" />
            Send Follow-up to All ({uncontactedCount})
          </>
        )}
      </button>
      {result && <p className="text-xs font-medium text-espresso mt-1">{result}</p>}
    </div>
  );
}
