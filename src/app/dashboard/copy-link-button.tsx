"use client";

import { useState } from "react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        copied
          ? "bg-green-50 text-success border-green-200"
          : "text-text-secondary border-border hover:border-border-hover hover:text-text"
      }`}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
