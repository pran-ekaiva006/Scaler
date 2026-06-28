"use client";

import React, { useState, useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";
import { KeyValueRow } from "@/lib/types";
import KeyValueTable from "../common/KeyValueTable";
import { Play, Save } from "lucide-react";
// import { sendProxyRequest, updateSavedRequest } from "@/lib/api"; // Will be used in next phases

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default function RequestBuilder() {
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const tabs = useTabsStore((state) => state.tabs);
  const updateTab = useTabsStore((state) => state.updateTab);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Local state for URL to avoid cursor jumping during typing
  const [urlInput, setUrlInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Active sub-tab (Params, Headers, Body, Auth)
  const [activeSubTab, setActiveSubTab] = useState("Params");

  // Sync tab.url -> urlInput when tab changes
  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.id]); // Only run on tab switch

  // Sync tab.url -> urlInput if tab.url gets updated by params change
  useEffect(() => {
    if (activeTab && document.activeElement?.id !== "url-input") {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url]);

  if (!activeTab) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
        Open a request to start building.
      </div>
    );
  }

  // --- Two Way Sync Logic ---

  // 1. URL -> Params (On blur of URL input)
  const handleUrlBlur = () => {
    if (!activeTab) return;
    
    updateTab(activeTab.id, { url: urlInput });

    try {
      const urlObj = new URL(urlInput);
      const searchParams = urlObj.searchParams;
      
      const newParams: KeyValueRow[] = [];
      searchParams.forEach((value, key) => {
        newParams.push({ key, value, enabled: true });
      });

      // Preserve disabled params that might not be in the URL string
      const disabledParams = activeTab.params.filter(p => p.enabled === false);
      
      updateTab(activeTab.id, { params: [...newParams, ...disabledParams] });
    } catch (e) {
      // Invalid URL, might just be typing {{base_url}}/foo. Don't parse params in this case.
      // But we can do a naive regex parse if we want, or just skip if it's not a real URL
      if (urlInput.includes("?")) {
        const queryStr = urlInput.split("?")[1];
        const searchParams = new URLSearchParams(queryStr);
        const newParams: KeyValueRow[] = [];
        searchParams.forEach((value, key) => {
          newParams.push({ key, value, enabled: true });
        });
        const disabledParams = activeTab.params.filter(p => p.enabled === false);
        updateTab(activeTab.id, { params: [...newParams, ...disabledParams] });
      }
    }
  };

  // 2. Params -> URL (When params table changes)
  const handleParamsChange = (newParams: KeyValueRow[]) => {
    updateTab(activeTab.id, { params: newParams });

    // Rebuild URL
    try {
      // Check if URL is valid to use URL object
      let baseUrl = urlInput.split("?")[0];
      const enabledParams = newParams.filter(p => p.enabled !== false && p.key);
      
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams();
        enabledParams.forEach(p => searchParams.append(p.key, p.value));
        const newUrl = `${baseUrl}?${searchParams.toString()}`;
        updateTab(activeTab.id, { url: newUrl });
        setUrlInput(newUrl); // Force update local state so we don't lag
      } else {
        updateTab(activeTab.id, { url: baseUrl });
        setUrlInput(baseUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      
      {/* Top Row: Method, URL, Send, Save */}
      <div style={{ display: "flex", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", flex: 1, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          
          <select
            value={activeTab.method}
            onChange={(e) => updateTab(activeTab.id, { method: e.target.value })}
            className={`method-${activeTab.method}`}
            style={{
              background: "var(--bg-input)",
              border: "none",
              padding: "0 12px",
              outline: "none",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              borderRight: "1px solid var(--border-subtle)",
            }}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          
          <input
            id="url-input"
            type="text"
            placeholder="Enter request URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={(e) => e.key === "Enter" && handleUrlBlur()}
            style={{
              flex: 1,
              background: "var(--bg-input)",
              border: "none",
              padding: "0 12px",
              color: "white",
              fontSize: 13,
              outline: "none",
              fontFamily: "var(--font-mono)",
            }}
          />
        </div>

        <button
          className="btn-send"
          disabled={isSending}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <Play size={14} fill="currentColor" />
          <span>Send</span>
        </button>

        <button
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-default)",
            color: activeTab.isDirty ? "var(--text-primary)" : "var(--text-muted)",
            padding: "0 12px",
            borderRadius: "var(--radius-md)",
            cursor: activeTab.isDirty ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Save size={14} />
          Save
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", padding: "0 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        {["Params", "Headers", "Body", "Auth"].map((t) => (
          <div
            key={t}
            onClick={() => setActiveSubTab(t)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: activeSubTab === t ? "var(--accent-orange)" : "var(--text-secondary)",
              borderBottom: activeSubTab === t ? "2px solid var(--accent-orange)" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeSubTab === "Params" && (
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Query Parameters</h4>
            <KeyValueTable rows={activeTab.params} onChange={handleParamsChange} />
          </div>
        )}
        
        {activeSubTab === "Headers" && (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Headers configuration coming in later phase.</div>
        )}
        {activeSubTab === "Body" && (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Body configuration coming in later phase.</div>
        )}
        {activeSubTab === "Auth" && (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Auth configuration coming in later phase.</div>
        )}
      </div>

    </div>
  );
}
