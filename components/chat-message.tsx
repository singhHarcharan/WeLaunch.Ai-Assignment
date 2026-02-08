"use client";

import { Sparkles, Copy, Check } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { ToolInvocation } from "@/components/tool-invocation";
import type { UIMessage } from "ai";
import { useState } from "react";

interface Props {
  message: UIMessage;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  function copyContent() {
    const text = message.parts
      ?.filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("\n");
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.parts?.map((part, i) => {
            if (part.type === "text") {
              return <span key={i}>{part.text}</span>;
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mt-0.5">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        {message.parts?.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className="text-sm">
                <Markdown>{part.text}</Markdown>
              </div>
            );
          }
          if (part.type === "dynamic-tool" || part.type.startsWith("tool-")) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const toolPart = part as any;
            const toolName = toolPart.toolName || toolPart.type.replace("tool-", "");
            return (
              <ToolInvocation
                key={i}
                toolInvocation={{
                  toolCallId: toolPart.toolCallId,
                  toolName,
                  state: toolPart.state,
                  args: toolPart.input,
                  input: toolPart.input,
                  output: toolPart.output,
                }}
              />
            );
          }
          return null;
        })}

        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={copyContent}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Copy"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
