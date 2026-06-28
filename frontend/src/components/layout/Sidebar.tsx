"use client";

import React, { useState } from "react";
import { ChevronRight, Folder } from "lucide-react";
import CollectionsTree from "./CollectionsTree";
import HistoryList from "./HistoryList";
import Modal from "../common/Modal";
import { createCollection } from "@/lib/api";
import { useCollectionsStore } from "@/store/collectionsStore";
import { useToastStore } from "@/store/toastStore";

interface SidebarProps {
  activeTab: string;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const [showNewColModal, setShowNewColModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);
  const addToast = useToastStore((state) => state.addToast);

  const handleCreateCollection = async () => {
    if (!newColName.trim()) return;
    try {
      await createCollection({ name: newColName });
      setShowNewColModal(false);
      setNewColName("");
      await fetchCollections();
      addToast("Collection created successfully", "success");
    } catch (e: any) {
      addToast(e.message || "Failed to create collection", "error");
    }
  };
  return (
    <div
      style={{
        height: "100%",
        background: "var(--bg-sidebar)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: "12px 14px 10px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--text-secondary)",
          }}
        >
          {activeTab}
        </span>
        {activeTab === "collections" && (
          <button
            onClick={() => setShowNewColModal(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: 16,
              padding: "2px 4px",
              borderRadius: "var(--radius-sm)",
            }}
            title="New Collection"
          >
            +
          </button>
        )}
      </div>

      {/* Sidebar Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 6px",
        }}
      >
        {activeTab === "collections" && <CollectionsTree />}
        {activeTab === "history" && <HistoryList />}
        {activeTab === "environments" && <EnvironmentsPlaceholder />}
      </div>

      {/* New Collection Modal */}
      <Modal
        isOpen={showNewColModal}
        onClose={() => setShowNewColModal(false)}
        title="New Collection"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            autoFocus
            type="text"
            placeholder="Collection Name..."
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
            style={{
              padding: "8px 12px",
              background: "var(--bg-input)",
              color: "white",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-sm)",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setShowNewColModal(false)}
              style={{
                padding: "6px 12px",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button onClick={handleCreateCollection} className="btn-send">
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// removed CollectionsPlaceholder

// removed HistoryPlaceholder

function EnvironmentsPlaceholder() {
  const items = [
    { name: "Local", active: false },
    { name: "Production", active: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((env) => (
        <div
          key={env.name}
          style={{
            padding: "6px 8px",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-primary)",
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: env.active
                ? "var(--status-success)"
                : "var(--text-muted)",
            }}
          />
          {env.name}
          {env.active && (
            <span
              style={{
                marginLeft: "auto",
                fontSize: 10,
                color: "var(--status-success)",
                fontWeight: 600,
              }}
            >
              ACTIVE
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
