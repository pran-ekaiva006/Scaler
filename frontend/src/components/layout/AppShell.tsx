"use client";

import React, { useState, useEffect } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import IconRail from "./IconRail";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import TabBar from "./TabBar";
import { Zap } from "lucide-react";
import { useCollectionsStore } from "@/store/collectionsStore";
import { useEnvironmentsStore } from "@/store/environmentsStore";
import { useHistoryStore } from "@/store/historyStore";

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

  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);
  const fetchEnvironments = useEnvironmentsStore((state) => state.fetchEnvironments);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  
  const collections = useCollectionsStore((state) => state.collections);
  const environments = useEnvironmentsStore((state) => state.environments);
  const historyItems = useHistoryStore((state) => state.history);

  useEffect(() => {
    fetchCollections().then(() => console.log("Fetched collections on load"));
    fetchEnvironments().then(() => console.log("Fetched environments on load"));
    fetchHistory().then(() => console.log("Fetched history on load"));
  }, [fetchCollections, fetchEnvironments, fetchHistory]);

  // Temporary logging to verify state population
  useEffect(() => {
    if (collections.length > 0) console.log("Collections store hydrated:", collections);
    if (environments.length > 0) console.log("Environments store hydrated:", environments);
    if (historyItems.length > 0) console.log("History store hydrated:", historyItems);
  }, [collections, environments, historyItems]);

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
      <div style={{ opacity: 0.3, color: "var(--text-secondary)" }}>
        <Zap size={64} strokeWidth={1} />
      </div>
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
