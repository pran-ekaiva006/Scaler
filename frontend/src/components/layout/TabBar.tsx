"use client";

import React from "react";
import { useTabsStore } from "@/store/tabsStore";

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
  onNewTab: () => void;
  onSaveAs: (id: string) => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onNewTab,
  onSaveAs,
}: TabBarProps) {
  const updateTab = useTabsStore((state) => state.updateTab);
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);
  const [editingTabId, setEditingTabId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");

  React.useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClose = (e: React.MouseEvent, tab: Tab) => {
    e.stopPropagation();
    if (tab.isDirty) {
      if (!window.confirm("Unsaved changes — close anyway?")) {
        return;
      }
    }
    onTabClose(tab.id);
  };

  return (
    <div
      className="hide-scrollbar"
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
              flexShrink: 0,
              position: "relative",
            }}
          >
            <span className={`method-badge method-${tab.method}`}>
              {tab.method}
            </span>
            {editingTabId === tab.id ? (
              <input
                type="text"
                value={editingName}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => {
                  if (editingName.trim() && editingName.trim() !== tab.name) {
                    updateTab(tab.id, { name: editingName.trim() }, true);
                  }
                  setEditingTabId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (editingName.trim() && editingName.trim() !== tab.name) {
                      updateTab(tab.id, { name: editingName.trim() }, true);
                    }
                    setEditingTabId(null);
                  } else if (e.key === "Escape") {
                    setEditingTabId(null);
                  }
                }}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-focus)",
                  color: "white",
                  outline: "none",
                  fontSize: 12,
                  padding: "2px 4px",
                  borderRadius: "var(--radius-sm)",
                  width: 120,
                }}
              />
            ) : (
              <span
                className="truncate-text"
                style={{ maxWidth: 120 }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTabId(tab.id);
                  setEditingName(tab.name);
                }}
                title="Double-click to rename"
              >
                {tab.name}
              </span>
            )}
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
              {/* Dropdown Menu */}
              {isActive && (
                <div style={{ position: "relative" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === tab.id ? null : tab.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: 14,
                      padding: "0 4px",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    ⋮
                  </button>
                  
                  {menuOpenId === tab.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: 4,
                        background: "var(--bg-panel)",
                        border: "1px solid var(--border-default)",
                        borderRadius: "var(--radius-md)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
                        zIndex: 50,
                        minWidth: 120,
                        overflow: "hidden"
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(null);
                          onSaveAs(tab.id);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          background: "none",
                          border: "none",
                          padding: "8px 12px",
                          fontSize: 12,
                          color: "var(--text-primary)",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        Save As...
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={(e) => handleClose(e, tab)}
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

      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          cursor: "pointer",
          padding: "0 16px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
      >
        +
      </button>
    </div>
  );
}
