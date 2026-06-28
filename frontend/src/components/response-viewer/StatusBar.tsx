import React from "react";

export default function StatusBar({
  status,
  time_ms,
  size_bytes,
}: {
  status: number;
  time_ms: number;
  size_bytes: number;
}) {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "var(--status-success)";
    if (code >= 400 && code < 500) return "var(--status-client-error)";
    if (code >= 500) return "var(--status-server-error)";
    return "var(--text-secondary)";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "8px 16px",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border-subtle)",
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Status:</span>
        <span style={{ color: getStatusColor(status) }}>{status}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Time:</span>
        <span style={{ color: "var(--text-primary)" }}>{time_ms} ms</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>Size:</span>
        <span style={{ color: "var(--text-primary)" }}>{formatSize(size_bytes)}</span>
      </div>
    </div>
  );
}
