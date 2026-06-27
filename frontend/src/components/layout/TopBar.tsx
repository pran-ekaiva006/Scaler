"use client";

import React from "react";
import { Zap } from "lucide-react";

export default function TopBar() {
  return (
    <div
      style={{
        height: 42,
        minHeight: 42,
        background: "var(--bg-sidebar)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
      }}
    >
      {/* Left — App name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent-orange)",
          }}
        >
          <Zap size={18} fill="currentColor" strokeWidth={1} />
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Postman Clone
        </span>
      </div>

      {/* Right — Environment selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}
        >
          Environment:
        </span>
        <select
          style={{
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "3px 8px",
            fontSize: 12,
            outline: "none",
            cursor: "pointer",
            minWidth: 140,
          }}
          defaultValue="production"
        >
          <option value="">No Environment</option>
          <option value="local">Local</option>
          <option value="production">Production</option>
        </select>
      </div>
    </div>
  );
}
