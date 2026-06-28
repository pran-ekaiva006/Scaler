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
import ToastContainer from "../common/ToastContainer";
import PlaceholderPage from "./PlaceholderPage";
import SettingsPlaceholder from "./SettingsPlaceholder";
import { useCollectionsStore } from "@/store/collectionsStore";
import { useEnvironmentsStore } from "@/store/environmentsStore";
import { useHistoryStore } from "@/store/historyStore";
import RequestBuilder from "../request-builder/RequestBuilder";
import ResponseViewer from "../response-viewer/ResponseViewer";
import { useTabsStore } from "@/store/tabsStore";

export default function AppShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [sidebarTab, setSidebarTab] = useState("collections");
  
  const tabs = useTabsStore((state) => state.tabs);
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const setActiveTabId = useTabsStore((state) => state.setActiveTab);
  const handleTabClose = useTabsStore((state) => state.closeTab);
  const createBlankTab = useTabsStore((state) => state.createBlankTab);
  const openSaveModal = useTabsStore((state) => state.openSaveModal);

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
      <ToastContainer />

      {/* Icon Rail */}
      <IconRail activeTab={sidebarTab} onTabChange={setSidebarTab} />

      {/* Sidebar + Main Content or Placeholder Overlay */}
      {["collections", "history", "environments"].includes(sidebarTab) ? (
        <PanelGroup orientation="horizontal" style={{ flex: 1 }}>
          {/* Sidebar Panel */}
          <Panel defaultSize={25} minSize={20} id="sidebar" style={{ minWidth: 250 }}>
            <Sidebar activeTab={sidebarTab} />
          </Panel>

          <PanelResizeHandle
            style={{
              width: "8px",
              background: "transparent",
              cursor: "col-resize",
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "2px", height: "100%", background: "var(--border-subtle)" }} />
          </PanelResizeHandle>

          {/* Main Panel */}
          <Panel id="main">
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                background: "var(--bg-panel)",
                minWidth: 0,
              }}
            >
              <TopBar />
              <TabBar
                tabs={tabs}
                activeTabId={activeTabId}
                onTabClick={setActiveTabId}
                onTabClose={handleTabClose}
                onNewTab={createBlankTab}
                onSaveAs={(id) => openSaveModal("saveAs", id)}
              />

              <div
                style={{
                  flex: 1,
                  overflow: "hidden", // must be hidden for PanelGroup to work right
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PanelGroup orientation="vertical" style={{ flex: 1 }}>
                  <Panel id="request" defaultSize={50} minSize={20}>
                    <RequestBuilder />
                  </Panel>
                  <PanelResizeHandle
                    style={{
                      height: "8px",
                      background: "transparent",
                      cursor: "row-resize",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ height: "2px", width: "100%", background: "var(--border-subtle)" }} />
                  </PanelResizeHandle>
                  <Panel id="response" defaultSize={50} minSize={20}>
                    {(() => {
                      const activeTab = tabs.find((t) => t.id === activeTabId);
                      return <ResponseViewer response={activeTab?.response} noTabOpen={!activeTab} />;
                    })()}
                  </Panel>
                </PanelGroup>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      ) : (
        <div style={{ flex: 1, background: "var(--bg-panel)", overflow: "hidden" }}>
          {sidebarTab === "settings" ? (
            <SettingsPlaceholder />
          ) : (
            <PlaceholderPage tabId={sidebarTab} />
          )}
        </div>
      )}
    </div>
  );
}


