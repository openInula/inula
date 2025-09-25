"use client";

import React, { useEffect } from "react";
import Markdown from "react-markdown";

const highlightLink = {
  a: (
    props: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      children?: React.ReactNode;
    }
  ) => (
    <a
      {...props}
      style={{
        color: "#2563eb",
        fontWeight: "bold",
        textDecoration: "underline",
        textUnderlineOffset: "2px",
        padding: "0 2px",
        borderRadius: "2px",
        background: "rgba(37,99,235,0.06)",
      }}
      className={
        (props.className ?? "") +
        " hover:brightness-110 transition duration-150"
      }
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  ),
};

interface MarkdownPageProps {
  mdUrl: string;
  className?: string;
}

const defaultClassName =
  "laws-prose mx-auto max-w-5xl px-4 py-8 bg-white dark:bg-neutral-900 rounded-lg shadow-md prose prose-lg prose-zinc dark:prose-invert";

export default function MarkdownPage({ mdUrl, className }: MarkdownPageProps) {
  const [md, setMd] = React.useState("");

  useEffect(() => {
    async function FetchMarkdown() {
      const res = await fetch(mdUrl);
      const md = await res.text();
      setMd(md);
    }
    FetchMarkdown();
  }, [mdUrl]);

  return (
    <div
      className={
        className ? className + " " + defaultClassName : defaultClassName
      }
      style={{ fontSize: "0.9rem" }}
    >
      <Markdown components={highlightLink}>{md}</Markdown>
    </div>
  );
}
