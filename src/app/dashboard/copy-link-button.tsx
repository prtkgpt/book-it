"use client";

export function CopyLinkButton({ url }: { url: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="text-sm text-gray-600 hover:text-black px-3 py-1 border rounded"
    >
      Copy Link
    </button>
  );
}
