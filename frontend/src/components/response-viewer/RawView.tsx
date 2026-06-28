import React from "react";

export default function RawView({ body }: { body: string }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 16,
        overflow: "auto",
        background: "var(--bg-panel)",
      }}
    >
      <pre
        style={{
          margin: 0,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-primary)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {body}
      </pre>
    </div>
  );
}
