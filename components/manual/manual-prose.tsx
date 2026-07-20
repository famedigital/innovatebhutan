"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ManualProse({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-3xl",
        "prose-headings:scroll-mt-20 prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:mt-10",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:bg-muted prose-pre:border",
        "prose-table:text-sm",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith("/")) {
              return <Link href={href}>{children}</Link>;
            }
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
