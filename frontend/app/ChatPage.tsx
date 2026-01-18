"use client";

import { useMemo, useState } from "react";

type Video = {
  video_id: string;
  title: string;
  channel: string;
  published_at: string;
  thumbnail: string;
  views: number;
  likes: number;
  url: string;
  description?: string;
};

type ChatResponse = {
  query: string;
  results: Video[];
};

type Msg =
  | { role: "user"; text: string }
  | { role: "assistant"; query: string; videos: Video[] };

function formatNumber(n: number) {
  return new Intl.NumberFormat().format(n);
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default function ChatPage() {
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "assistant",
      query: "Try: “learn python decorators”",
      videos: [],
    },
  ]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${BACKEND}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Backend error ${resp.status}: ${errText}`);
      }

      const data = (await resp.json()) as ChatResponse;

      setMsgs((m) => [
        ...m,
        { role: "assistant", query: data.query, videos: data.results ?? [] },
      ]);
    } catch (e: any) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          query: "Error",
          videos: [],
        },
      ]);
      alert(e?.message ?? "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">Video-GPT</div>
          <div className="text-xs text-neutral-400">Chat UI • Top 5 videos</div>
        </div>
      </div>

      {/* Chat */}
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        {msgs.map((msg, idx) => {
          if (msg.role === "user") {
            return (
              <div key={idx} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-neutral-800 px-4 py-3">
                  <div className="text-sm leading-relaxed">{msg.text}</div>
                </div>
              </div>
            );
          }

          // assistant message
          return (
            <div key={idx} className="flex justify-start">
              <div className="w-full max-w-[90%] rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3">
                <div className="text-sm text-neutral-300">
                  {msg.query === "Error"
                    ? "Something went wrong. Try again."
                    : `Here are 5 videos for: `}
                  {msg.query !== "Error" && (
                    <span className="text-neutral-100 font-medium">“{msg.query}”</span>
                  )}
                </div>

                {msg.videos.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {msg.videos.map((v) => (
                      <a
                        key={v.video_id}
                        href={v.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 transition overflow-hidden"
                      >
                        <div className="flex">
                          <div className="w-40 shrink-0 bg-neutral-900">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="h-24 w-40 object-cover"
                            />
                          </div>
                          <div className="p-3 flex-1">
                            <div className="text-sm font-medium line-clamp-2 group-hover:underline">
                              {v.title}
                            </div>
                            <div className="mt-1 text-xs text-neutral-400">
                              {v.channel}
                            </div>
                            <div className="mt-2 text-xs text-neutral-500 flex gap-3 flex-wrap">
                              <span>{formatNumber(v.views)} views</span>
                              {v.likes ? <span>{formatNumber(v.likes)} likes</span> : null}
                              <span>{formatDate(v.published_at)}</span>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {msg.videos.length === 0 && msg.query !== "Error" && (
                  <div className="mt-3 text-xs text-neutral-500">
                    Ask a query to see video results.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Input */}
        <div className="sticky bottom-0 bg-neutral-950 pt-4 pb-6">
          <div className="border border-neutral-800 rounded-2xl p-2 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Ask something… (e.g., ‘learn python decorators’)"
              className="flex-1 bg-transparent outline-none px-3 py-2 text-sm"
            />
            <button
              onClick={send}
              disabled={!canSend}
              className="rounded-xl px-4 py-2 text-sm bg-white text-black disabled:opacity-40"
            >
              {loading ? "…" : "Send"}
            </button>
          </div>
          <div className="mt-2 text-[11px] text-neutral-500">
            Backend: {BACKEND}
          </div>
        </div>
      </div>
    </div>
  );
}


