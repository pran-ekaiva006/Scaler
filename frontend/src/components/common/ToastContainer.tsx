"use client";

import React from "react";
import { useToastStore } from "@/store/toastStore";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === "success";
        const isError = toast.type === "error";

        return (
          <div
            key={toast.id}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              minWidth: 300,
              maxWidth: 400,
              pointerEvents: "auto",
              borderLeft: `4px solid ${
                isSuccess
                  ? "var(--status-success)"
                  : isError
                  ? "var(--status-client-error)"
                  : "var(--accent-orange)"
              }`,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {isSuccess && <CheckCircle2 size={16} color="var(--status-success)" />}
              {isError && <AlertCircle size={16} color="var(--status-client-error)" />}
              {!isSuccess && !isError && <Info size={16} color="var(--accent-orange)" />}
            </div>
            
            <div
              style={{
                flex: 1,
                fontSize: 13,
                color: "var(--text-primary)",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
