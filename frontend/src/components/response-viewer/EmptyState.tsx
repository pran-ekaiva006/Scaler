import React from "react";
import { Zap } from "lucide-react";

export default function EmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "var(--text-muted)",
        height: "100%",
        background: "var(--bg-panel)",
      }}
    >
      <div style={{ opacity: 0.3, color: "var(--text-secondary)" }}>
        <Zap size={48} strokeWidth={1} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        Send a request to see the response here
      </div>
    </div>
  );
}
