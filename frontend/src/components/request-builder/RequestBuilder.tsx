"use client";

import React, { useState, useEffect } from "react";
import { useTabsStore } from "@/store/tabsStore";
import { KeyValueRow, RequestBody, Auth } from "@/lib/types";
import KeyValueTable from "../common/KeyValueTable";
import { Play, Save, Loader2 } from "lucide-react";
import { useEnvironmentsStore } from "@/store/environmentsStore";
import { useHistoryStore } from "@/store/historyStore";
import { sendProxyRequest, updateSavedRequest } from "@/lib/api";
import { ProxySendPayload } from "@/lib/types";
import VariableHighlightInput from "../common/VariableHighlightInput";
import SaveRequestModal from "./SaveRequestModal";
import { useCollectionsStore } from "@/store/collectionsStore";
import { Zap } from "lucide-react";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

export default function RequestBuilder() {
  const activeTabId = useTabsStore((state) => state.activeTabId);
  const tabs = useTabsStore((state) => state.tabs);
  const updateTab = useTabsStore((state) => state.updateTab);
  const saveModalConfig = useTabsStore((state) => state.saveModalConfig);
  const openSaveModal = useTabsStore((state) => state.openSaveModal);
  const closeSaveModal = useTabsStore((state) => state.closeSaveModal);
  const activeEnvironmentId = useEnvironmentsStore((state) => state.activeEnvironmentId);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [urlInput, setUrlInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("Params");
  const [jsonError, setJsonError] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.id]);

  useEffect(() => {
    if (activeTab && document.activeElement?.id !== "url-input") {
      setUrlInput(activeTab.url);
    }
  }, [activeTab?.url]);

  useEffect(() => {
    if (activeTab?.body_type === "raw" && activeTab?.body?.raw_content_type === "json") {
      try {
        if (activeTab.body.raw_content && activeTab.body.raw_content.trim() !== "") {
          JSON.parse(activeTab.body.raw_content);
        }
        setJsonError(false);
      } catch (e) {
        setJsonError(true);
      }
    } else {
      setJsonError(false);
    }
  }, [activeTab?.body?.raw_content, activeTab?.body?.raw_content_type, activeTab?.body_type]);

  if (!activeTab) {
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
          height: "100%",
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
      </div>
    );
  }

  const handleUrlBlur = () => {
    if (!activeTab) return;
    updateTab(activeTab.id, { url: urlInput }, true);
    try {
      const urlObj = new URL(urlInput);
      const searchParams = urlObj.searchParams;
      const newParams: KeyValueRow[] = [];
      searchParams.forEach((value, key) => {
        newParams.push({ key, value, enabled: true });
      });
      const disabledParams = activeTab.params.filter(p => p.enabled === false);
      updateTab(activeTab.id, { params: [...newParams, ...disabledParams] }, true);
    } catch (e) {
      if (urlInput.includes("?")) {
        const queryStr = urlInput.split("?")[1];
        const searchParams = new URLSearchParams(queryStr);
        const newParams: KeyValueRow[] = [];
        searchParams.forEach((value, key) => {
          newParams.push({ key, value, enabled: true });
        });
        const disabledParams = activeTab.params.filter(p => p.enabled === false);
        updateTab(activeTab.id, { params: [...newParams, ...disabledParams] }, true);
      }
    }
  };

  const handleParamsChange = (newParams: KeyValueRow[]) => {
    updateTab(activeTab.id, { params: newParams }, true);
    try {
      let baseUrl = urlInput.split("?")[0];
      const enabledParams = newParams.filter(p => p.enabled !== false && p.key);
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams();
        enabledParams.forEach(p => searchParams.append(p.key, p.value));
        const newUrl = `${baseUrl}?${searchParams.toString()}`;
        updateTab(activeTab.id, { url: newUrl }, true);
        setUrlInput(newUrl);
      } else {
        updateTab(activeTab.id, { url: baseUrl }, true);
        setUrlInput(baseUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleHeadersChange = (newHeaders: KeyValueRow[]) => {
    updateTab(activeTab.id, { headers: newHeaders }, true);
  };

  const handleBodyTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTab(activeTab.id, { body_type: e.target.value }, true);
  };
  
  const handleBodyRawContentChange = (content: string) => {
    const currentBody = activeTab.body || {};
    updateTab(activeTab.id, { body: { ...currentBody, raw_content: content } }, true);
  };
  
  const handleBodyRawContentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currentBody = activeTab.body || {};
    updateTab(activeTab.id, { body: { ...currentBody, raw_content_type: e.target.value } }, true);
  };
  
  const handleBodyFormDataChange = (formData: KeyValueRow[]) => {
    const currentBody = activeTab.body || {};
    updateTab(activeTab.id, { body: { ...currentBody, form_data: formData } }, true);
  };

  const handleAuthTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTab(activeTab.id, { auth_type: e.target.value }, true);
  };

  const handleAuthUpdate = (field: keyof Auth, value: string) => {
    const currentAuth = activeTab.auth || {};
    updateTab(activeTab.id, { auth: { ...currentAuth, [field]: value } }, true);
  };

  const handleSend = async () => {
    if (!activeTab || isSending) return;
    
    setIsSending(true);
    const tabId = activeTab.id; // capture to avoid race conditions
    
    // Filter out file types from form_data to prevent JSON.stringify crash
    let cleanFormData = undefined;
    if (activeTab.body_type === "form-data" && activeTab.body?.form_data) {
      cleanFormData = activeTab.body.form_data.filter(row => row.type !== "file");
    } else {
      cleanFormData = activeTab.body?.form_data;
    }

    const payload: ProxySendPayload = {
      method: activeTab.method,
      url: activeTab.url,
      params: activeTab.params,
      headers: activeTab.headers,
      body_type: activeTab.body_type,
      body: activeTab.body ? {
        ...activeTab.body,
        form_data: cleanFormData
      } : undefined,
      auth_type: activeTab.auth_type,
      auth: activeTab.auth || undefined,
      environment_id: activeEnvironmentId ?? undefined,
      request_id: activeTab.savedRequestId ?? undefined,
    };

    try {
      const response = await sendProxyRequest(payload);
      updateTab(tabId, { response }); // isEdit is false by default
      await fetchHistory();
    } catch (err: any) {
      updateTab(tabId, {
        response: {
          error: "Request Failed",
          message: err.message || "An unexpected error occurred",
        }
      }); // isEdit is false by default
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveBtnClick = async () => {
    if (!activeTab.savedRequestId) {
      openSaveModal("save", activeTab.id);
      return;
    }
    
    // Direct PUT update
    try {
      const dataToSave = {
        name: activeTab.name,
        method: activeTab.method,
        url: activeTab.url,
        params: activeTab.params,
        headers: activeTab.headers,
        body_type: activeTab.body_type,
        body: activeTab.body || undefined,
        auth_type: activeTab.auth_type,
        auth: activeTab.auth || undefined,
      };
      await updateSavedRequest(activeTab.savedRequestId, dataToSave);
      updateTab(activeTab.id, { isDirty: false }); // explicit isDirty false, isEdit=false
      await fetchCollections();
    } catch (e) {
      console.error("Failed to update saved request", e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", padding: "12px 16px", gap: 8, borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", flex: 1, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <select
            value={activeTab.method}
            onChange={(e) => updateTab(activeTab.id, { method: e.target.value }, true)}
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
          
          <VariableHighlightInput
            id="url-input"
            placeholder="Enter request URL"
            value={urlInput}
            onChange={(val) => setUrlInput(val)}
            onBlur={handleUrlBlur}
            onKeyDown={(e) => e.key === "Enter" && handleUrlBlur()}
            style={{
              flex: 1,
              background: "var(--bg-input)",
              padding: "0 12px",
              fontSize: 13,
            }}
          />
        </div>

        <button
          className="btn-send"
          disabled={isSending}
          onClick={handleSend}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {isSending ? (
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Play size={14} fill="currentColor" />
          )}
          <span>{isSending ? "Sending..." : "Send"}</span>
        </button>

        <button
          onClick={handleSaveBtnClick}
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-default)",
            color: activeTab.isDirty ? "var(--text-primary)" : "var(--text-muted)",
            padding: "0 12px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
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

      {saveModalConfig && saveModalConfig.isOpen && saveModalConfig.tabId === activeTab.id && (
        <SaveRequestModal
          mode={saveModalConfig.mode}
          initialName={activeTab.name}
          payload={activeTab}
          onClose={closeSaveModal}
          onSuccess={(savedRequestId, newName) => {
            updateTab(activeTab.id, { savedRequestId, name: newName, isDirty: false }); // explicit isDirty false
            closeSaveModal();
          }}
        />
      )}

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

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeSubTab === "Params" && (
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Query Parameters</h4>
            <KeyValueTable rows={activeTab.params || []} onChange={handleParamsChange} />
          </div>
        )}
        
        {activeSubTab === "Headers" && (
          <div>
            <h4 style={{ margin: "0 0 12px 0", fontSize: 12, textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 600 }}>Headers</h4>
            <KeyValueTable rows={activeTab.headers || []} onChange={handleHeadersChange} />
          </div>
        )}
        
        {activeSubTab === "Body" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <select
                value={activeTab.body_type || "none"}
                onChange={handleBodyTypeChange}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  outline: "none",
                }}
              >
                <option value="none">none</option>
                <option value="raw">raw</option>
                <option value="form-data">form-data</option>
                <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
              </select>

              {activeTab.body_type === "raw" && (
                <select
                  value={activeTab.body?.raw_content_type || "text"}
                  onChange={handleBodyRawContentTypeChange}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-default)",
                    color: "var(--text-primary)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    outline: "none",
                  }}
                >
                  <option value="text">Text</option>
                  <option value="json">JSON</option>
                </select>
              )}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {(!activeTab.body_type || activeTab.body_type === "none") && (
                <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 16 }}>
                  This request does not have a body.
                </div>
              )}
              
              {activeTab.body_type === "raw" && (
                <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column" }}>
                  <textarea
                    value={activeTab.body?.raw_content || ""}
                    onChange={(e) => handleBodyRawContentChange(e.target.value)}
                    placeholder={activeTab.body?.raw_content_type === "json" ? '{\n  "key": "value"\n}' : "Enter raw body..."}
                    style={{
                      flex: 1,
                      minHeight: 200,
                      background: "var(--bg-input)",
                      border: jsonError ? "1px solid var(--status-client-error)" : "1px solid var(--border-default)",
                      borderRadius: "var(--radius-md)",
                      color: "white",
                      padding: 12,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      outline: "none",
                      resize: "none",
                    }}
                  />
                  {jsonError && (
                    <div style={{ position: "absolute", bottom: 12, right: 12, color: "var(--status-client-error)", fontSize: 11, fontWeight: 600, background: "var(--bg-panel)", padding: "2px 6px", borderRadius: 4 }}>
                      Invalid JSON
                    </div>
                  )}
                </div>
              )}

              {activeTab.body_type === "form-data" && (
                <KeyValueTable
                  rows={activeTab.body?.form_data || []}
                  onChange={handleBodyFormDataChange}
                  showTypeToggle={true}
                />
              )}

              {activeTab.body_type === "x-www-form-urlencoded" && (
                <KeyValueTable
                  rows={activeTab.body?.form_data || []}
                  onChange={handleBodyFormDataChange}
                  showTypeToggle={false}
                />
              )}
            </div>
          </div>
        )}
        
        {activeSubTab === "Auth" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Type</span>
              <select
                value={activeTab.auth_type || "none"}
                onChange={handleAuthTypeChange}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  outline: "none",
                  width: 200,
                }}
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            <div style={{ padding: 16, background: "var(--bg-panel)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              {(!activeTab.auth_type || activeTab.auth_type === "none") && (
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  This request does not use any authorization.
                </div>
              )}

              {activeTab.auth_type === "bearer" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Token</label>
                  <input
                    type="text"
                    value={activeTab.auth?.token || ""}
                    onChange={(e) => handleAuthUpdate("token", e.target.value)}
                    placeholder="Enter bearer token"
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-default)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>
              )}

              {activeTab.auth_type === "basic" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Username</label>
                    <input
                      type="text"
                      value={activeTab.auth?.username || ""}
                      onChange={(e) => handleAuthUpdate("username", e.target.value)}
                      placeholder="Username"
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>Password</label>
                    <input
                      type="password"
                      value={activeTab.auth?.password || ""}
                      onChange={(e) => handleAuthUpdate("password", e.target.value)}
                      placeholder="Password"
                      style={{
                        background: "var(--bg-input)",
                        border: "1px solid var(--border-default)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
