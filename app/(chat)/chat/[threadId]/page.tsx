"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ChatBot } from "@/components/chat-bot";
import type { UIMessage } from "ai";

export default function ChatThreadPage() {
  const params = useParams();
  const chatId = params.threadId as string;
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);

  useEffect(() => {
    fetch(`/api/messages?chatId=${chatId}`)
      .then((r) => r.json())
      .then((msgs) => {
        const formatted: UIMessage[] = msgs
          .filter((m: { role: string }) => m.role !== "tool")
          .map((m: { _id: string; role: string; content: string }, i: number) => ({
            id: m._id || `msg-${i}`,
            role: m.role as "user" | "assistant",
            content: m.content,
            parts: [{ type: "text" as const, text: m.content }],
          }));
        setInitialMessages(formatted);
      })
      .catch(() => setInitialMessages([]));
  }, [chatId]);

  if (!initialMessages) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <ChatBot key={chatId} chatId={chatId} initialMessages={initialMessages} />;
}
