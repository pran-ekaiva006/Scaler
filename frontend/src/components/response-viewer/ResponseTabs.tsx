import React from "react";

export default function ResponseTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = ["Pretty", "Raw", "Headers"];

  return (
    <div
      style={{
        display: "flex",
        padding: "0 16px",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-panel)",
      }}
    >
      {tabs.map((t) => (
        <div
          key={t}
          onClick={() => onTabChange(t)}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: 500,
            color: activeTab === t ? "var(--accent-orange)" : "var(--text-secondary)",
            borderBottom: activeTab === t ? "2px solid var(--accent-orange)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          {t}
        </div>
      ))}
    </div>
  );
}
