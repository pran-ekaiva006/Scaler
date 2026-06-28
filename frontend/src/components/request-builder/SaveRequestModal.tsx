import React, { useState } from "react";
import { useCollectionsStore } from "@/store/collectionsStore";
import { createSavedRequest } from "@/lib/api";
import { X, Save } from "lucide-react";

interface SaveRequestModalProps {
  initialName: string;
  payload: any; // The request payload to save
  mode: "save" | "saveAs";
  onClose: () => void;
  onSuccess: (savedRequestId: number, newName: string) => void;
}

export default function SaveRequestModal({ initialName, payload, mode, onClose, onSuccess }: SaveRequestModalProps) {
  const { collections, fetchCollections } = useCollectionsStore();
  
  const [name, setName] = useState(initialName || "Untitled Request");
  const [collectionId, setCollectionId] = useState<string>(
    collections.length > 0 ? collections[0].id.toString() : ""
  );
  
  const selectedCollection = collections.find(c => c.id.toString() === collectionId);
  const [folderId, setFolderId] = useState<string>(""); // "" means no folder (root)
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!collectionId) {
      setError("Please select a collection");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const dataToSave = {
        name,
        method: payload.method,
        url: payload.url,
        folder_id: folderId ? parseInt(folderId, 10) : undefined,
        // Stringify the arrays/objects since the backend expects JSON strings for these fields if not native JSON types
        // Actually, our API schema expects arrays and objects directly if it's a JSON field. Let's send them directly.
        params: payload.params,
        headers: payload.headers,
        body_type: payload.body_type,
        body: payload.body,
        auth_type: payload.auth_type,
        auth: payload.auth,
      };

      const res = await createSavedRequest(parseInt(collectionId, 10), dataToSave);
      
      // Refresh sidebar
      await fetchCollections();
      
      // Callback to update the tab
      onSuccess(res.id, res.name);
    } catch (err: any) {
      setError(err.message || "Failed to save request");
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "var(--bg-panel)", width: 400, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" }}>
        
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            {mode === "saveAs" ? "Save As" : "Save Request"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              Request Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Get User Profile"
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box"
              }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              Collection
            </label>
            <select
              value={collectionId}
              onChange={(e) => {
                setCollectionId(e.target.value);
                setFolderId(""); // reset folder on collection change
              }}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              {collections.length === 0 && <option value="">No collections available</option>}
              {collections.map(c => (
                <option key={c.id} value={c.id.toString()}>{c.name}</option>
              ))}
            </select>
          </div>

          {selectedCollection && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Folder (Optional)
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer",
                  boxSizing: "border-box"
                }}
              >
                <option value="">(no folder, save to collection root)</option>
                {selectedCollection.folders?.map(f => (
                  <option key={f.id} value={f.id.toString()}>📁 {f.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div style={{ color: "var(--status-client-error)", fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                background: "transparent",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !collectionId}
              style={{
                background: "var(--accent-orange)",
                border: "none",
                color: "white",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 600,
                cursor: isSaving || !collectionId ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: isSaving || !collectionId ? 0.6 : 1
              }}
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
