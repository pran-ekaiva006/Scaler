import React from "react";
import { Server, Activity, Book, Users } from "lucide-react";

export default function PlaceholderPage({ tabId }: { tabId: string }) {
  let icon = <Server size={48} strokeWidth={1} />;
  let title = "Coming Soon";
  let description = "This feature is currently under development.";

  switch (tabId) {
    case "mock_servers":
      icon = <Server size={48} strokeWidth={1} />;
      title = "Mock Servers";
      description = "Create realistic mock endpoints to simulate API behavior before building the backend.";
      break;
    case "monitors":
      icon = <Activity size={48} strokeWidth={1} />;
      title = "Monitors";
      description = "Schedule API tests and track uptime or performance on a recurring basis.";
      break;
    case "api_docs":
      icon = <Book size={48} strokeWidth={1} />;
      title = "API Documentation";
      description = "Automatically generate and host beautiful documentation from your collections.";
      break;
    case "team":
      icon = <Users size={48} strokeWidth={1} />;
      title = "Team Workspaces";
      description = "Collaborate with your team, share collections, and manage roles in real-time.";
      break;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--text-muted)",
        gap: 16,
      }}
    >
      <div style={{ opacity: 0.3, color: "var(--text-secondary)" }}>
        {icon}
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
        {title}
      </div>
      <div style={{ fontSize: 14, maxWidth: 300, textAlign: "center" }}>
        {description}
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          background: "var(--bg-active)",
          padding: "4px 8px",
          borderRadius: "var(--radius-sm)",
          color: "var(--accent-orange)",
        }}
      >
        Coming Soon
      </div>
    </div>
  );
}
