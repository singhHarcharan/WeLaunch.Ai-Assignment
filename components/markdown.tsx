"use client";

import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { LinkIcon, Copy, Check } from "lucide-react";
import { useState } from "react";

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";
  const code = String(children).replace(/\n$/, "");

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border/50 bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
        <span className="text-xs font-medium text-muted-foreground">{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className={className}>{code}</code>
      </pre>
    </div>
  );
}

const components: Partial<Components> = {
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props}>{children}</h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-semibold mt-5 mb-2 text-foreground" {...props}>{children}</h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props}>{children}</h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold mt-4 mb-1 text-foreground" {...props}>{children}</h4>
  ),
  p: ({ children }) => (
    <p className="leading-7 my-3 break-words text-foreground/90">{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-3 ml-6 list-disc space-y-1.5 marker:text-muted-foreground/60" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-3 ml-6 list-decimal space-y-1.5 marker:text-muted-foreground/60" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-7 text-foreground/90 pl-1" {...props}>{children}</li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>{children}</strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic text-foreground/80" {...props}>{children}</em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-3 border-primary/40 bg-muted/20 py-3 px-4 rounded-r-xl text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = /language-(\w+)/.test(className || "");
    if (isBlock) {
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }
    return (
      <code className="rounded-md bg-muted/50 border border-border/40 px-1.5 py-0.5 text-[13px] font-mono text-primary" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    // If child is a CodeBlock, render directly
    const child = React.Children.toArray(children)[0] as React.ReactElement<{ className?: string }> | undefined;
    if (child?.props?.className?.includes("language-")) {
      return <>{children}</>;
    }
    return (
      <pre className="my-4 overflow-x-auto rounded-xl bg-muted/30 border border-border/50 p-4 text-sm">
        {children}
      </pre>
    );
  },
  a: ({ children, href, ...props }) => (
    <a
      className="inline-flex items-center gap-1 cursor-pointer text-primary hover:underline transition-colors"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      <LinkIcon className="h-3 w-3 shrink-0" />
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-border/50">
      <table className="w-full text-sm" {...props}>{children}</table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/30 border-b border-border/50" {...props}>{children}</thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody className="divide-y divide-border/30" {...props}>{children}</tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="transition-colors hover:bg-muted/10" {...props}>{children}</tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-2.5 text-left font-semibold text-foreground/80 text-xs uppercase tracking-wider" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-2.5 text-foreground/80" {...props}>{children}</td>
  ),
  hr: () => <hr className="my-6 border-border/40" />,
  img: ({ src, alt, ...props }) =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="my-4 mx-auto rounded-xl max-w-full" src={src} alt={alt || ""} {...props} />
    ) : null,
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <article className="w-full">
      <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
        {children}
      </ReactMarkdown>
    </article>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
