"use client";

import { useState } from "react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const fullUrl = `${window.location.origin}${path}`;
    navigator.clipboard.writeText(fullUrl);
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
