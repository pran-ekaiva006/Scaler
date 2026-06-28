import React from "react";
import { AlertCircle } from "lucide-react";

export default function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: 24,
        background: "var(--bg-panel)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 16,
          background: "rgba(220, 38, 38, 0.1)", // Light red background
          border: "1px solid var(--status-server-error)",
          borderRadius: "var(--radius-md)",
          color: "var(--status-server-error)",
        }}
      >
        <AlertCircle size={20} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Could not send request</span>
          <span style={{ fontSize: 13, opacity: 0.9 }}>{message}</span>
        </div>
      </div>
    </div>
  );
}
