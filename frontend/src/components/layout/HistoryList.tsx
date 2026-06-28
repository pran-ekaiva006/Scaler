"use client";

import React, { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { useHistoryStore } from "@/store/historyStore";
import { useTabsStore } from "@/store/tabsStore";
import { clearHistory } from "@/lib/api";
import { HistoryEntry } from "@/lib/types";
import Modal from "../common/Modal";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryList() {
  const history = useHistoryStore((state) => state.history);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const openTab = useTabsStore((state) => state.openTab);

  const [searchQuery, setSearchQuery] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredHistory = history.filter((h) =>
    h.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearAll = async () => {
    await clearHistory();
    setShowClearConfirm(false);
    await fetchHistory();
  };

  const handleOpenHistory = (h: HistoryEntry) => {
    openTab({
      id: `hist-${h.id}`, // unique id so we can open multiple history snapshots if we want
      savedRequestId: h.request_id,
      name: h.name || h.url,
      method: h.method,
      url: h.url,
      params: h.params || [],
      headers: h.headers || [],
      body_type: h.body_type || "none",
      body: h.body || null,
      auth_type: h.auth_type || "none",
      auth: h.auth || null,
      isDirty: false,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "var(--bg-input)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            padding: "4px 8px",
          }}
        >
          <Search size={14} color="var(--text-muted)" style={{ marginRight: 6 }} />
          <input
            type="text"
            placeholder="Filter history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              outline: "none",
              fontSize: 12,
              width: "100%",
            }}
          />
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          title="Clear All History"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 4,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredHistory.map((h) => (
          <div
            key={h.id}
            onClick={() => handleOpenHistory(h)}
            style={{
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span className={`method-badge method-${h.method}`} style={{ width: 36, textAlign: "left", fontSize: 9 }}>
              {h.method}
            </span>
            <span className="truncate-text" style={{ color: "var(--text-secondary)", flex: 1 }}>
              {h.url}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>
              {timeAgo(h.created_at)}
            </span>
          </div>
        ))}
        {filteredHistory.length === 0 && (
          <div style={{ padding: 12, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
            No history found
          </div>
        )}
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear History"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
            Are you sure you want to clear all history? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              onClick={() => setShowClearConfirm(false)}
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              style={{
                padding: "6px 12px",
                background: "var(--status-client-error)",
                color: "white",
                border: "none",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
