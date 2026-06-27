"use client";

import React from "react";
import { ChevronRight, Folder } from "lucide-react";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  return (
    <div
      style={{
        height: "100%",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
          }}
        >
          {activeTab}
        </span>
        <button
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 16,
            padding: "2px 4px",
            borderRadius: "var(--radius-sm)",
          }}
          title="New"
        >
          +
        </button>
      </div>

      {/* Sidebar Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 6px",
        }}
      >
        {activeTab === "collections" && <CollectionsPlaceholder />}
        {activeTab === "history" && <HistoryPlaceholder />}
        {activeTab === "environments" && <EnvironmentsPlaceholder />}
      </div>
    </div>
  );
}

function CollectionsPlaceholder() {
  const items = [
    {
      name: "JSONPlaceholder Demo",
      folders: ["Users", "Posts"],
    },
    {
      name: "HTTPBin Demo",
      folders: [],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((col) => (
        <div key={col.name}>
          <div
            style={{
              padding: "6px 8px",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--text-primary)",
              fontSize: 13,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <span className="truncate-text">{col.name}</span>
          </div>
          {col.folders.map((f) => (
            <div
              key={f}
              style={{
                padding: "5px 8px 5px 28px",
                fontSize: 12,
                color: "var(--text-secondary)",
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Folder size={14} color="var(--text-secondary)" style={{ marginRight: 6, flexShrink: 0 }} />
              <span className="truncate-text">{f}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function HistoryPlaceholder() {
  const items = [
    { method: "GET", url: "/users", status: 200, time: "342ms" },
    { method: "POST", url: "/posts", status: 201, time: "523ms" },
    { method: "GET", url: "/users/999", status: 404, time: "156ms" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((h, i) => (
        <div
          key={i}
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span className={`method-badge method-${h.method}`}>
            {h.method}
          </span>
          <span
            className="truncate-text"
            style={{ color: "var(--text-secondary)", flex: 1 }}
          >
            {h.url}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
            {h.time}
          </span>
        </div>
      ))}
    </div>
  );
}

function EnvironmentsPlaceholder() {
  const items = [
    { name: "Local", active: false },
    { name: "Production", active: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((env) => (
        <div
          key={env.name}
          style={{
            padding: "6px 8px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-primary)",
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: env.active
                ? "var(--status-success)"
                : "var(--text-muted)",
            }}
          />
          {env.name}
          {env.active && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "var(--status-success)",
                fontWeight: 600,
              }}
            >
              ACTIVE
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
