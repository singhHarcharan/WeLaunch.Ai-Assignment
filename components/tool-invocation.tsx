"use client";

import { Globe, Loader2, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";

interface ToolInvocationData {
  toolCallId: string;
  toolName: string;
  state: string;
  args?: Record<string, unknown>;
  result?: Record<string, unknown>;
  input?: unknown;
  output?: unknown;
}

interface Props {
  toolInvocation: ToolInvocationData;
}

function parseResults(output: unknown): Array<{ title: string; url: string; content?: string }> {
  if (!output) return [];

  let data = output;

  // If output is a string, try to parse as JSON
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }

  // If it's an array directly
  if (Array.isArray(data)) {
    return data;
  }

  // If it has a results array
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.results)) return obj.results;
  }

  return [];
}

export function ToolInvocation({ toolInvocation }: Props) {
  const { toolName, state } = toolInvocation;
  const args = toolInvocation.args || (toolInvocation.input as Record<string, unknown>);
  const [expanded, setExpanded] = useState(false);

  const isSearching = state === "call" || state === "input-available" || state === "input-streaming";
  const isDone = state === "result" || state === "output-available";
  const isWebSearch = toolName === "web_search" || toolName === "tavily_search" || toolName === "tavily_search_results";
  const results = useMemo(() => parseResults(toolInvocation.output), [toolInvocation.output]);

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
      <button
        onClick={() => isDone && setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm"
      >
        {isWebSearch ? (
          <Globe className="h-4 w-4 text-blue-400 shrink-0" />
        ) : (
          <div className="h-4 w-4 rounded bg-muted shrink-0" />
        )}
        <span className="font-medium text-foreground/90">
          {isWebSearch
            ? isSearching
              ? "Searching the web..."
              : "Searched the web"
            : toolName}
        </span>
        {isSearching && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
        {args?.query ? (
          <span className="text-muted-foreground truncate text-xs">
            for &quot;{String(args.query)}&quot;
          </span>
        ) : null}
        {isDone && (
          <span className="ml-auto text-muted-foreground/60">
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </span>
        )}
      </button>

      {expanded && isDone && (
        <div className="border-t border-border/30 px-3.5 py-2.5 space-y-2">
          {results.length > 0 ? (
            results.slice(0, 5).map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 rounded-lg p-2 text-xs hover:bg-muted/50 transition-colors group"
              >
                <ExternalLink className="h-3 w-3 mt-0.5 text-muted-foreground/50 shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-blue-400 group-hover:underline truncate">
                    {r.title}
                  </div>
                  {r.content && (
                    <div className="text-muted-foreground/60 line-clamp-2 mt-0.5">
                      {r.content}
                    </div>
                  )}
                </div>
              </a>
            ))
          ) : (
            <p className="text-xs text-muted-foreground/60">Search completed</p>
          )}
        </div>
      )}
    </div>
  );
}
