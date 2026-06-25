"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EscalationFlow } from "@/components/chat/escalation-flow";
import { CrisisResourcesPanel, type CrisisResource } from "@/components/chat/crisis-resources-panel";
import { shouldShowCrisisResources, shouldShowEscalation } from "@/lib/ai/risk";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import type { RiskAssessment } from "@/types";
import { Mic, MicOff, Send, Sparkles, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  initialConversationId?: string;
  initialMessages?: { role: "user" | "assistant"; content: string }[];
}

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function toUIMessages(messages: { role: "user" | "assistant"; content: string }[]): UIMessage[] {
  return messages.map((m, i) => ({
    id: `history-${i}`,
    role: m.role,
    parts: [{ type: "text" as const, text: m.content }],
  }));
}

/** Strip residual markdown the model might still produce */
function clean(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "• ");
}

/**
 * Formats a complete AI message into neat readable paragraphs.
 * Converts bullet lines to a styled list, splits on double-newlines.
 */
function formatMessage(text: string): React.ReactNode {
  const cleaned = clean(text);
  // Split into blocks on double newlines
  const blocks = cleaned.split(/\n{2,}/);

  return (
    <div className="space-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter(Boolean);

        // If every line starts with a bullet, render as list
        if (lines.length > 1 && lines.every((l) => l.trimStart().startsWith("• "))) {
          return (
            <ul key={bi} className="space-y-1.5 pl-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <span>{l.replace(/^•\s*/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={bi} className="leading-[1.75]">
            {lines.join(" ")}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Types out text one character at a time.
 * - While streaming: each tick appends one character from targetRef
 * - When streaming ends: immediately shows full text
 */
function AnimatedText({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  // History messages start fully displayed; new streaming messages start empty
  const [displayed, setDisplayed] = useState(() => (isStreaming ? "" : text));
  const targetRef = useRef(text);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep target always up-to-date so the tick closure reads the latest value
  useEffect(() => {
    targetRef.current = text;
  }, [text]);

  useEffect(() => {
    if (!isStreaming) {
      // Stream done — cancel any pending tick and snap to full text
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setDisplayed(text);
      return;
    }

    // Start the tick loop only if not already running
    if (timerRef.current !== null) return;

    function tick() {
      setDisplayed((cur) => {
        const target = targetRef.current;
        if (cur.length < target.length) {
          // Schedule next character
          timerRef.current = setTimeout(tick, 16); // ~60 chars / sec
          return cur + target[cur.length];
        }
        // Caught up — wait for more characters
        timerRef.current = setTimeout(tick, 16);
        return cur;
      });
    }

    timerRef.current = setTimeout(tick, 16);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStreaming]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <>{formatMessage(displayed)}</>;
}

const SUGGESTIONS = [
  "I've been feeling really anxious about exams lately",
  "Some classmates have been making me feel uncomfortable",
  "I'm struggling to keep up and feeling completely burnt out",
  "I don't have anyone to talk to about what I'm going through",
];

export function ChatInterface({ initialConversationId, initialMessages = [] }: ChatInterfaceProps) {
  const conversationIdRef = useRef(initialConversationId);
  const [input, setInput] = useState("");
  const [escalationOpen, setEscalationOpen] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [crisisResources, setCrisisResources] = useState<CrisisResource[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceBaseRef = useRef("");
  const { isListening, isSupported, error: voiceError, toggle: toggleVoice, stop: stopVoice } =
    useSpeechRecognition();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: conversationIdRef.current }),
        fetch: async (url, options) => {
          const response = await fetch(url, options);
          const convId = response.headers.get("X-Conversation-Id");
          if (convId) conversationIdRef.current = convId;
          return response;
        },
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: toUIMessages(initialMessages),
    onFinish: async () => {
      const convId = conversationIdRef.current;
      if (!convId) return;
      await new Promise((r) => setTimeout(r, 1200));
      try {
        const res = await fetch(`/api/chat/risk?conversationId=${convId}`);
        const data = await res.json();
        if (data.assessment) {
          setAssessment(data.assessment);
          if (shouldShowEscalation(data.assessment)) setEscalationOpen(true);
          if (shouldShowCrisisResources(data.assessment)) {
            try {
              const crRes = await fetch(
                `/api/chat/crisis-resources?category=${data.assessment.category}`
              );
              const crData = await crRes.json();
              if (crData.resources) setCrisisResources(crData.resources);
            } catch { /* non-critical */ }
          }
        }
      } catch { /* non-critical */ }
    },
  });

  const isStreaming = status === "streaming";
  const isSubmitted = status === "submitted";
  const isLoading = isSubmitted || isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    stopVoice();
    const text = input.trim();
    setInput("");
    voiceBaseRef.current = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await sendMessage({ text });
  }

  function handleVoiceToggle() {
    if (isListening) {
      stopVoice();
      return;
    }
    voiceBaseRef.current = input.trim() ? `${input.trim()} ` : "";
    toggleVoice((text, isFinal) => {
      if (isFinal) {
        voiceBaseRef.current = `${voiceBaseRef.current}${text} `;
        setInput(voiceBaseRef.current);
      } else {
        setInput(`${voiceBaseRef.current}${text}`);
      }
    });
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold">SafeVoice AI</p>
          <p className="text-xs text-muted-foreground">Wellbeing assistant · Strictly confidential</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-5">
          {isEmpty && (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <p className="text-base font-semibold">Hi, I&apos;m here for you</p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                This is a safe, confidential space. What&apos;s on your mind today?
              </p>
              <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => {
            const rawText = getMessageText(message);
            const isUser = message.role === "user";
            const isLastAI = !isUser && i === messages.length - 1;

            return (
              <div
                key={message.id}
                className={cn("flex animate-fade-in", isUser ? "justify-end" : "justify-start")}
              >
                {!isUser && (
                  <div className="mr-2.5 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm",
                    isUser
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  )}
                >
                  {isUser ? (
                    <p className="leading-relaxed">{rawText}</p>
                  ) : (
                    <>
                      <AnimatedText
                        text={clean(rawText)}
                        isStreaming={isLastAI && isStreaming}
                      />
                      {/* Blinking cursor while the last AI message is actively streaming */}
                      {isLastAI && isStreaming && (
                        <span className="ml-0.5 inline-block h-[14px] w-[2px] translate-y-[2px] animate-pulse bg-current opacity-60" />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking dots (before first token) */}
          {isSubmitted && (
            <div className="flex animate-fade-in justify-start">
              <div className="mr-2.5 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-4 py-3.5">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />

          {assessment && shouldShowCrisisResources(assessment) && crisisResources.length > 0 && (
            <CrisisResourcesPanel
              resources={crisisResources}
              riskLevel={assessment.riskLevel}
              className="mt-2"
            />
          )}
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          {voiceError && (
            <p className="mb-2 text-center text-xs text-destructive">{voiceError}</p>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-sm transition-all focus-within:border-primary/40 focus-within:shadow-md">
            {isSupported && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  "h-8 w-8 shrink-0 rounded-lg",
                  isListening && "bg-destructive/10 text-destructive hover:bg-destructive/20"
                )}
                onClick={handleVoiceToggle}
                disabled={isLoading}
                title={isListening ? "Stop recording" : "Speak to SafeVoice"}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </Button>
            )}
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={isListening ? "Listening… speak now" : "Share what's on your mind… (Enter to send)"}
              className="min-h-[36px] flex-1 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-lg"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Everything is confidential. In a crisis, contact emergency services immediately.
          </p>
        </form>
      </div>

      {assessment && conversationIdRef.current && (
        <EscalationFlow
          open={escalationOpen}
          onOpenChange={setEscalationOpen}
          conversationId={conversationIdRef.current}
          assessment={assessment}
        />
      )}
    </div>
  );
}
