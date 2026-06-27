"use client";

import React from "react";

interface Tab {
  id: string;
  name: string;
  method: string;
  isDirty?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
}: TabBarProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      style={{
        height: 36,
        minHeight: 36,
        background: "var(--tab-inactive-bg)",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "flex-end",
        overflowX: "auto",
        overflowY: "hidden",
        gap: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              background: isActive
                ? "var(--tab-active-bg)"
                : "var(--tab-inactive-bg)",
              borderTop: isActive
                ? "2px solid var(--tab-border-active)"
                : "2px solid transparent",
              borderRight: "1px solid var(--border-subtle)",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              transition: "background 0.1s, color 0.1s",
              whiteSpace: "nowrap",
              maxWidth: 200,
              position: "relative",
            }}
          >
            <span className={`method-badge method-${tab.method}`}>
              {tab.method}
            </span>
            <span className="truncate-text" style={{ maxWidth: 120 }}>
              {tab.name}
            </span>
            {tab.isDirty && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-orange)",
                  flexShrink: 0,
                }}
              />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 14,
                padding: "0 2px",
                lineHeight: 1,
                borderRadius: "var(--radius-sm)",
                transition: "color 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
