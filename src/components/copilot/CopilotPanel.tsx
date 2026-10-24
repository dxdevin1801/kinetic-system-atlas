import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp, BookMarked, RotateCcw, Sparkles, X } from "lucide-react";
import { useCopilot } from "@/store/copilot";
import { useLab } from "@/store/lab";
import { useApp } from "@/store/app";
import { localProvider } from "@/lib/copilot/engine";
import { PARTS, type PartId } from "@/data/fan";
import { cn } from "@/lib/utils";

const STARTERS = [
  "Explain the affinity laws",
  "What does the shroud do?",
  "What is the riskiest failure mode?",
  "Why seven blades and four struts?",
];

export function CopilotPanel() {
  const { open, setOpen, messages, add, update, clear, consumePending, pending } = useCopilot();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const selectedNode = useLab((s) => s.selectedNode);
  const depth = useApp((s) => s.copilotDepth);
  const setSetting = useApp((s) => s.set);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedPart = selectedNode in PARTS ? (selectedNode as PartId) : undefined;

  const send = useCallback(
    async (q: string) => {
      const text = q.trim();
      if (!text || busy) return;
      setBusy(true);
      setInput("");
      add({ id: crypto.randomUUID(), role: "user", text });
      const id = crypto.randomUUID();
      add({ id, role: "assistant", text: "", streaming: true });
      const reply = await localProvider.respond(text, { route: path, selectedPart, depth });
      const words = reply.text.split(" ");
      let i = 0;
      const timer = window.setInterval(() => {
        i = Math.min(words.length, i + 3);
        update(id, { text: words.slice(0, i).join(" ") });
        if (i >= words.length) {
          window.clearInterval(timer);
          update(id, { streaming: false, reply });
          setBusy(false);
        }
      }, 28);
    },
    [add, update, busy, path, selectedPart, depth],
  );

  useEffect(() => {
    if (open && pending) {
      const q = consumePending();
      if (q) void send(q);
    }
  }, [open, pending, consumePending, send]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close SystemX Copilot" : "Open SystemX Copilot"}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-12 items-center gap-2 rounded-full pl-3 pr-4 font-medium transition-all duration-300",
          "bg-primary-gradient text-primary-foreground shadow-glow hover:-translate-y-0.5 hover:brightness-110",
          open && "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <Sparkles className="size-5" />
        <span className="text-sm">Copilot</span>
      </button>

      <aside
        role="dialog"
        aria-label="SystemX Copilot"
        aria-hidden={!open}
        className={cn(
          "glass fixed bottom-4 right-4 z-50 flex h-[min(620px,calc(100vh-6rem))] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid size-8 place-items-center rounded-lg bg-primary-gradient text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">SystemX Copilot</div>
            <div className="truncate text-[11px] text-muted-foreground">
              {selectedPart ? `Context · ${PARTS[selectedPart].name}` : "Axial fan knowledge base"}
            </div>
          </div>
          <div className="flex rounded-lg border border-border p-0.5 text-[11px]">
            {(["simple", "technical"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setSetting({ copilotDepth: d })}
                className={cn(
                  "rounded-md px-2 py-1 capitalize transition-colors",
                  depth === d ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <button onClick={clear} className="text-muted-foreground hover:text-foreground" aria-label="Clear conversation">
            <RotateCcw className="size-4" />
          </button>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask about any component, equation, design decision or failure cause. I'll keep it simple — switch to{" "}
                <span className="text-foreground">Technical</span> for the full detail.
              </p>
              <div className="grid gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-lg border border-border bg-surface/50 px-3 py-2 text-left text-sm transition-all hover:border-hairline hover:bg-accent/40"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm">{m.text}</div>
              </div>
            ) : (
              <div key={m.id} className="space-y-2.5">
                <div className="text-sm leading-relaxed text-foreground/90">
                  {m.text || (
                    <span className="inline-flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 animate-pulse-soft rounded-full bg-cyan"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </span>
                  )}
                </div>
                {m.reply?.equation && (
                  <div className="rounded-lg border border-hairline bg-surface/70 px-3 py-2 font-mono text-[13px]">
                    {m.reply.equation}
                  </div>
                )}
                {m.reply?.sources.length ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <BookMarked className="size-3" />
                    {m.reply.sources.join(" · ")}
                  </div>
                ) : null}
                {m.reply?.followups.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {m.reply.followups.map((f) => (
                      <button
                        key={f}
                        onClick={() => send(f)}
                        className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-hairline hover:text-foreground"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ),
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-border p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-border bg-surface/60 p-2 focus-within:border-hairline">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Ask about a part, physics or failure…"
              className="max-h-28 min-h-8 flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              aria-label="Send"
              className="grid size-8 place-items-center rounded-lg bg-primary-gradient text-primary-foreground transition-opacity disabled:opacity-40"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
