"use client";

import { Folder, History, Globe, Server, Activity, Book, Users, Settings } from "lucide-react";

const RAIL_ICONS = [
  { id: "collections", label: "Collections", icon: <Folder size={20} strokeWidth={1.5} /> },
  { id: "history", label: "History", icon: <History size={20} strokeWidth={1.5} /> },
  { id: "environments", label: "Environments", icon: <Globe size={20} strokeWidth={1.5} /> },
  { id: "mock_servers", label: "Mock Servers", icon: <Server size={20} strokeWidth={1.5} /> },
  { id: "monitors", label: "Monitors", icon: <Activity size={20} strokeWidth={1.5} /> },
  { id: "api_docs", label: "API Documentation", icon: <Book size={20} strokeWidth={1.5} /> },
  { id: "team", label: "Team Workspaces", icon: <Users size={20} strokeWidth={1.5} /> },
  { id: "settings", label: "Settings", icon: <Settings size={20} strokeWidth={1.5} /> },
];

interface IconRailProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function IconRail({ activeTab, onTabChange }: IconRailProps) {
  return (
    <div
      style={{
        width: 48,
        minWidth: 48,
        height: "100%",
        background: "var(--bg-rail)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 8,
        gap: 4,
      }}
    >
      {RAIL_ICONS.map((item) => (
        <button
          key={item.id}
          title={item.label}
          onClick={() => onTabChange(item.id)}
          style={{
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "var(--radius-md)",
            border: "none",
            background:
              activeTab === item.id ? "var(--bg-active)" : "transparent",
            cursor: "pointer",
            fontSize: 18,
            transition: "background 0.15s ease",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== item.id)
              e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== item.id)
              e.currentTarget.style.background = "transparent";
          }}
        >
          {item.icon}
          {activeTab === item.id && (
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 6,
                bottom: 6,
                width: 3,
                borderRadius: "0 2px 2px 0",
                background: "var(--accent-orange)",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
