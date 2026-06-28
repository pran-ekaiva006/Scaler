"use client";

import React, { useState } from "react";
import { Zap } from "lucide-react";
import { useEnvironmentsStore } from "@/store/environmentsStore";
import EnvironmentManagerModal from "../environments/EnvironmentManagerModal";

export default function TopBar() {
  const { environments, activeEnvironmentId, activateEnvironment } = useEnvironmentsStore();
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const handleEnvironmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "manage") {
      setIsManagerOpen(true);
      return;
    }
    
    const envId = val ? parseInt(val, 10) : null;
    try {
      await activateEnvironment(envId);
    } catch (err) {
      console.error("Failed to activate environment:", err);
    }
  };
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
          Postman
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
          value={activeEnvironmentId === null ? "" : activeEnvironmentId.toString()}
          onChange={handleEnvironmentChange}
        >
          <option value="">No Environment</option>
          {environments.map((env) => (
            <option key={env.id} value={env.id.toString()}>
              {env.name}
            </option>
          ))}
          <option disabled>──────────</option>
          <option value="manage">Manage Environments...</option>
        </select>
      </div>

      {isManagerOpen && <EnvironmentManagerModal onClose={() => setIsManagerOpen(false)} />}
    </div>
  );
}
