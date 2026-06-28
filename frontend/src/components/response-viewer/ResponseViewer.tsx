import React, { useState } from "react";
import { ProxyResponse } from "@/lib/types";
import StatusBar from "./StatusBar";
import ResponseTabs from "./ResponseTabs";
import PrettyView from "./PrettyView";
import RawView from "./RawView";
import HeadersView from "./HeadersView";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

export default function ResponseViewer({ response }: { response?: ProxyResponse }) {
  const [activeTab, setActiveTab] = useState("Pretty");

  if (!response) {
    return <EmptyState />;
  }

  if (response.error) {
    return <ErrorState message={response.message || response.error} />;
  }

  // At this point, we know it's a successful ProxyResponse without an error.
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg-panel)" }}>
      <StatusBar
        status={response.status || 0}
        time_ms={response.time_ms || 0}
        size_bytes={response.size_bytes || 0}
      />
      <ResponseTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {activeTab === "Pretty" && (
          <PrettyView body={response.body || ""} isJson={response.is_json || false} />
        )}
        {activeTab === "Raw" && (
          <RawView body={response.body || ""} />
        )}
        {activeTab === "Headers" && (
          <HeadersView headers={response.headers || {}} />
        )}
      </div>
    </div>
  );
}
