"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, MoreHorizontal } from "lucide-react";
import { useCollectionsStore } from "@/store/collectionsStore";
import { useTabsStore } from "@/store/tabsStore";
import {
  createCollection,
  deleteCollection,
  createFolder,
  deleteFolder,
  createSavedRequest,
  deleteSavedRequest,
} from "@/lib/api";
import { Collection, Folder as FolderType, SavedRequest } from "@/lib/types";
import Modal from "../common/Modal";

export default function CollectionsTree() {
  const collections = useCollectionsStore((state) => state.collections);
  const fetchCollections = useCollectionsStore((state) => state.fetchCollections);
  const openTab = useTabsStore((state) => state.openTab);

  const [expandedCols, setExpandedCols] = useState<Set<number>>(new Set());
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  // Modal state
  const [modalType, setModalType] = useState<"collection" | "folder" | "request" | null>(null);
  const [modalTargetId, setModalTargetId] = useState<number | null>(null);
  const [modalInput, setModalInput] = useState("");

  const toggleCol = (id: number) => {
    const newSet = new Set(expandedCols);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedCols(newSet);
  };

  const toggleFolder = (id: number) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedFolders(newSet);
  };

  const handleOpenRequest = (req: SavedRequest) => {
    openTab({
      id: `saved-${req.id}`,
      savedRequestId: req.id,
      name: req.name,
      method: req.method,
      url: req.url,
      params: req.params || [],
      headers: req.headers || [],
      body_type: req.body_type || "none",
      body: req.body || null,
      auth_type: req.auth_type || "none",
      auth: req.auth || null,
      isDirty: false,
    });
  };

  const handleCreateCollection = async () => {
    if (!modalInput.trim()) return;
    await createCollection({ name: modalInput });
    setModalType(null);
    setModalInput("");
    await fetchCollections();
  };

  const handleCreateFolder = async () => {
    if (!modalInput.trim() || !modalTargetId) return;
    await createFolder(modalTargetId, { name: modalInput });
    setExpandedCols(new Set(expandedCols).add(modalTargetId));
    setModalType(null);
    setModalInput("");
    await fetchCollections();
  };

  const handleCreateRequest = async (isFolder: boolean) => {
    if (!modalInput.trim() || !modalTargetId) return;

    // If target is folder, we need collectionId. Let's find it.
    let colId = modalTargetId; // assume it's collection initially
    let folderId: number | undefined = undefined;

    if (isFolder) {
      folderId = modalTargetId;
      // find collection id
      const col = collections.find(c => c.folders.some(f => f.id === folderId));
      if (col) colId = col.id;
    }

    await createSavedRequest(colId, {
      name: modalInput,
      method: "GET",
      url: "https://",
      folder_id: folderId,
    });

    if (isFolder) setExpandedFolders(new Set(expandedFolders).add(modalTargetId));
    else setExpandedCols(new Set(expandedCols).add(modalTargetId));

    setModalType(null);
    setModalInput("");
    await fetchCollections();
  };

  const submitModal = () => {
    if (modalType === "collection") handleCreateCollection();
    else if (modalType === "folder") handleCreateFolder();
    else if (modalType === "request") handleCreateRequest(false);
    else if (modalType === "request-folder") handleCreateRequest(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {collections.map((col) => {
        const isColExpanded = expandedCols.has(col.id);
        return (
          <div key={col.id}>
            <div
              style={{
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--text-primary)",
                fontSize: 13,
                transition: "background 0.1s",
              }}
              className="group"
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div onClick={() => toggleCol(col.id)} style={{ display: "flex", alignItems: "center", flex: 1, gap: 6 }}>
                {isColExpanded ? <ChevronDown size={14} color="var(--text-muted)" /> : <ChevronRight size={14} color="var(--text-muted)" />}
                <span className="truncate-text">{col.name}</span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  title="Add Folder"
                  onClick={() => { setModalTargetId(col.id); setModalType("folder"); setModalInput(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  +F
                </button>
                <button
                  title="Add Request"
                  onClick={() => { setModalTargetId(col.id); setModalType("request"); setModalInput(""); }}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  +R
                </button>
                <button
                  title="Delete Collection"
                  onClick={async () => { await deleteCollection(col.id); fetchCollections(); }}
                  style={{ background: "none", border: "none", color: "var(--status-client-error)", cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            </div>

            {isColExpanded && (
              <div style={{ display: "flex", flexDirection: "column", marginLeft: 14, borderLeft: "1px solid var(--border-subtle)", paddingLeft: 4 }}>
                {col.folders.map((f) => {
                  const isFolderExpanded = expandedFolders.has(f.id);
                  return (
                    <div key={f.id}>
                      <div
                        style={{
                          padding: "5px 8px 5px 4px",
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          borderRadius: "var(--radius-sm)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div onClick={() => toggleFolder(f.id)} style={{ display: "flex", alignItems: "center", flex: 1, gap: 6 }}>
                          {isFolderExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          <Folder size={12} />
                          <span className="truncate-text">{f.name}</span>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            title="Add Request"
                            onClick={() => { setModalTargetId(f.id); setModalType("request-folder"); setModalInput(""); }}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 10 }}
                          >
                            +R
                          </button>
                          <button
                            title="Delete Folder"
                            onClick={async () => { await deleteFolder(f.id); fetchCollections(); }}
                            style={{ background: "none", border: "none", color: "var(--status-client-error)", cursor: "pointer", fontSize: 10 }}
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {isFolderExpanded && (
                        <div style={{ display: "flex", flexDirection: "column", marginLeft: 14, borderLeft: "1px solid var(--border-subtle)", paddingLeft: 4 }}>
                          {f.requests.map((req) => (
                            <RequestRow key={req.id} req={req} onClick={() => handleOpenRequest(req)} onRefresh={fetchCollections} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {col.requests.map((req) => (
                  <RequestRow key={req.id} req={req} onClick={() => handleOpenRequest(req)} onRefresh={fetchCollections} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={
          modalType === "collection" ? "New Collection" :
            modalType === "folder" ? "New Folder" :
              "New Request"
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            autoFocus
            type="text"
            placeholder="Name..."
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitModal()}
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
              onClick={() => setModalType(null)}
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
            <button
              onClick={submitModal}
              className="btn-send"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function RequestRow({ req, onClick, onRefresh }: { req: SavedRequest, onClick: () => void, onRefresh: () => void }) {
  return (
    <div
      style={{
        padding: "5px 8px",
        fontSize: 12,
        color: "var(--text-secondary)",
        cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", flex: 1, gap: 8 }}>
        <span className={`method-badge method-${req.method}`} style={{ fontSize: 9, width: 36, textAlign: "left" }}>
          {req.method}
        </span>
        <span className="truncate-text">{req.name}</span>
      </div>
      <button
        title="Delete Request"
        onClick={async (e) => { e.stopPropagation(); await deleteSavedRequest(req.id); onRefresh(); }}
        style={{ background: "none", border: "none", color: "var(--status-client-error)", cursor: "pointer", fontSize: 10, padding: 2 }}
      >
        ×
      </button>
    </div>
  );
}
