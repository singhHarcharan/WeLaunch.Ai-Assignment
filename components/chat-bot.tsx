"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Sparkles, ArrowUp } from "lucide-react";
import { ChatMessage } from "@/components/chat-message";
import type { UIMessage } from "ai";

interface Props {
  chatId: string;
  initialMessages?: UIMessage[];
}

const sampleQuestions = [
  "What's the latest news about AI?",
  "Explain quantum computing simply",
  "What are the top tech trends right now?",
  "Search for recent breakthroughs in science",
];

export function ChatBot({ chatId, initialMessages = [] }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
      body: { chatId },
    })
  );

  const { messages, sendMessage, status } = useChat({
    transport: transport.current,
    messages: initialMessages,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    const isFirstMessage = messages.length === 0;
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await sendMessage({ text });
    if (isFirstMessage && typeof window !== "undefined") {
      const title = text.slice(0, 80);
      window.dispatchEvent(
        new CustomEvent("chat-title-optimistic", {
          detail: { chatId, title },
        })
      );
    }
  }

  function handleSampleQuestion(q: string) {
    if (isLoading) return;
    sendMessage({ text: q });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="mx-auto max-w-3xl px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] pt-20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-1">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground mb-10">
                Ask me anything or try one of these
              </p>
              <div className="grid gap-2 sm:grid-cols-2 w-full max-w-xl">
                {sampleQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSampleQuestion(q)}
                    className="cursor-pointer rounded-xl border border-border/60 bg-card/80 p-3.5 text-left text-sm text-foreground/80 transition-all hover:bg-accent hover:border-border hover:shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-6 pb-32">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  </div>
                  <div className="flex items-center">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Claude-like sticky bottom */}
      <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end rounded-2xl border border-border/60 bg-muted/30 shadow-sm transition-colors focus-within:border-border focus-within:bg-muted/50">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI..."
                className="flex-1 resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 max-h-[200px]"
                rows={1}
                disabled={isLoading}
              />
              <div className="p-2">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 disabled:hover:bg-primary"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
