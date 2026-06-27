"use client";

import React, { useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import IconRail from "./IconRail";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TabBar from "./TabBar";

const PLACEHOLDER_TABS = [
  { id: "1", name: "Get Users", method: "GET" },
  { id: "2", name: "Create Post", method: "POST", isDirty: true },
];

export default function AppShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [sidebarTab, setSidebarTab] = useState("collections");
  const [activeTabId, setActiveTabId] = useState<string | null>("1");
  const [tabs, setTabs] = useState(PLACEHOLDER_TABS);

  const handleTabClose = (id: string) => {
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) {
      setActiveTabId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Icon Rail */}
      <IconRail activeTab={sidebarTab} onTabChange={setSidebarTab} />

      {/* Sidebar + Main Content */}
      <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
        {/* Sidebar Panel */}
        <Panel
          defaultSize="20%"
          minSize="15%"
          maxSize="35%"
          id="sidebar"
        >
          <Sidebar activeTab={sidebarTab} />
        </Panel>

        <PanelResizeHandle />

        {/* Main Panel */}
        <Panel id="main">
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-panel)",
            }}
          >
            {/* Top Bar */}
            <TopBar />

            {/* Tab Bar */}
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onTabClick={setActiveTabId}
              onTabClose={handleTabClose}
            />

            {/* Main Content Area */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children || <EmptyState />}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: 48, opacity: 0.3 }}>⚡</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)" }}>
        Ready to send a request
      </div>
      <div style={{ fontSize: 13 }}>
        Select a request from the sidebar, or create a new one
      </div>
      <button className="btn-send" style={{ marginTop: 8 }}>
        + New Request
      </button>
    </div>
  );
}
