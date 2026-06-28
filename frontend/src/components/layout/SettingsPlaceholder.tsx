import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPlaceholder() {
  return (
    <div
      style={{
        padding: "48px 64px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 32,
        color: "var(--text-primary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
        <Settings size={24} color="var(--text-secondary)" />
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Settings</h1>
      </div>

      <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Theme Settings (Disabled) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.5, pointerEvents: "none" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Theme</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Choose your preferred interface theme.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>(coming soon)</span>
            <div
              style={{
                display: "flex",
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <button style={{ padding: "6px 12px", background: "none", border: "none", color: "var(--text-muted)" }}>Light</button>
              <button style={{ padding: "6px 12px", background: "var(--bg-active)", border: "none", color: "var(--text-primary)" }}>Dark</button>
              <button style={{ padding: "6px 12px", background: "none", border: "none", color: "var(--text-muted)" }}>System</button>
            </div>
          </div>
        </div>

        {/* Request Timeout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>Request Timeout</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Maximum time to wait for a proxy request to complete.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              defaultValue={30}
              style={{
                width: 60,
                padding: "6px 8px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-sm)",
                outline: "none",
                textAlign: "right",
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
}
