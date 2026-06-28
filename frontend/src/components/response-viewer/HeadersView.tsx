import React from "react";

export default function HeadersView({ headers }: { headers: Record<string, string> }) {
  const headerEntries = Object.entries(headers || {});

  if (headerEntries.length === 0) {
    return (
      <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 13, background: "var(--bg-panel)", flex: 1 }}>
        No headers found.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, padding: 16, overflow: "auto", background: "var(--bg-panel)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <th style={{ padding: "8px 0", color: "var(--text-muted)", fontWeight: 600, width: "30%" }}>Key</th>
            <th style={{ padding: "8px 0", color: "var(--text-muted)", fontWeight: 600 }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {headerEntries.map(([key, value]) => (
            <tr key={key} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "8px 0", color: "var(--text-primary)", fontWeight: 500, verticalAlign: "top", wordBreak: "break-all" }}>{key}</td>
              <td style={{ padding: "8px 0", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 12, wordBreak: "break-all" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
