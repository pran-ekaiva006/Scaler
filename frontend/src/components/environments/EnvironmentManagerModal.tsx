import React, { useState } from "react";
import { useEnvironmentsStore } from "@/store/environmentsStore";
import KeyValueTable from "../common/KeyValueTable";
import { KeyValueRow } from "@/lib/types";
import { Plus, Trash2, Edit2, X, Save } from "lucide-react";
import { useToastStore } from "@/store/toastStore";

export default function EnvironmentManagerModal({ onClose }: { onClose: () => void }) {
  const { environments, addEnvironment, renameEnvironment, removeEnvironment, syncVariables } = useEnvironmentsStore();
  const addToast = useToastStore((state) => state.addToast);
  const [selectedEnvId, setSelectedEnvId] = useState<number | null>(environments.length > 0 ? environments[0].id : null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const selectedEnv = environments.find(e => e.id === selectedEnvId);

  // Local state for the variables so we can edit them before saving
  const [localVars, setLocalVars] = useState<KeyValueRow[]>(() => {
    if (!selectedEnv) return [];
    return selectedEnv.variables.map(v => ({ key: v.key, value: v.value, enabled: v.enabled }));
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Update local vars when selected environment changes
  React.useEffect(() => {
    if (selectedEnv) {
      setLocalVars(selectedEnv.variables.map(v => ({ key: v.key, value: v.value, enabled: v.enabled })));
    } else {
      setLocalVars([]);
    }
  }, [selectedEnvId, selectedEnv?.variables]);

  const handleAdd = async () => {
    if (!newEnvName.trim()) return;
    try {
      await addEnvironment(newEnvName);
      setIsAdding(false);
      setNewEnvName("");
      addToast("Environment created", "success");
    } catch (e: any) {
      addToast(e.message || "Failed to create environment", "error");
    }
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await renameEnvironment(id, editName);
      setEditingId(null);
      setEditName("");
      addToast("Environment renamed", "success");
    } catch (e: any) {
      addToast(e.message || "Failed to rename environment", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this environment?")) {
      try {
        await removeEnvironment(id);
        if (selectedEnvId === id) {
          setSelectedEnvId(null);
        }
        addToast("Environment deleted", "success");
      } catch (e: any) {
        addToast(e.message || "Failed to delete environment", "error");
      }
    }
  };

  const handleSaveVariables = async () => {
    if (!selectedEnvId) return;
    setIsSaving(true);
    try {
      await syncVariables(selectedEnvId, localVars);
      addToast("Variables saved successfully", "success");
    } catch (e: any) {
      addToast(e.message || "Failed to save variables", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "var(--bg-panel)", width: 800, height: 600, borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", border: "1px solid var(--border-default)", overflow: "hidden", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)" }}>
        
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Manage Environments</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Body (Two pane) */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* Sidebar */}
          <div style={{ width: 250, borderRight: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", background: "var(--bg-sidebar)" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>Environments</span>
              <button onClick={() => setIsAdding(true)} style={{ background: "none", border: "none", color: "var(--accent-orange)", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <Plus size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto" }}>
              {isAdding && (
                <div style={{ padding: "8px 16px", display: "flex", gap: 8 }}>
                  <input
                    autoFocus
                    value={newEnvName}
                    onChange={(e) => setNewEnvName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    onBlur={() => setIsAdding(false)}
                    placeholder="New Environment..."
                    style={{ flex: 1, background: "var(--bg-input)", border: "1px solid var(--accent-orange)", color: "white", padding: "4px 8px", fontSize: 13, borderRadius: 4, outline: "none" }}
                  />
                </div>
              )}
              
              {environments.map(env => (
                <div
                  key={env.id}
                  onClick={() => setSelectedEnvId(env.id)}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: selectedEnvId === env.id ? "rgba(255, 107, 43, 0.1)" : "transparent",
                    color: selectedEnvId === env.id ? "var(--text-primary)" : "var(--text-secondary)",
                    borderLeft: selectedEnvId === env.id ? "2px solid var(--accent-orange)" : "2px solid transparent",
                  }}
                >
                  {editingId === env.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(env.id)}
                      onBlur={() => setEditingId(null)}
                      style={{ flex: 1, background: "var(--bg-input)", border: "1px solid var(--accent-orange)", color: "white", padding: "4px 8px", fontSize: 13, borderRadius: 4, outline: "none" }}
                    />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {env.name}
                    </span>
                  )}
                  
                  {editingId !== env.id && (
                    <div style={{ display: "flex", gap: 8, opacity: selectedEnvId === env.id ? 1 : 0.3 }}>
                      <Edit2 size={14} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setEditingId(env.id); setEditName(env.name); }} />
                      <Trash2 size={14} style={{ cursor: "pointer", color: "var(--status-client-error)" }} onClick={(e) => { e.stopPropagation(); handleDelete(env.id); }} />
                    </div>
                  )}
                </div>
              ))}
              
              {environments.length === 0 && !isAdding && (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No environments found.
                </div>
              )}
            </div>
          </div>

          {/* Main Pane */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {selectedEnv ? (
              <>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{selectedEnv.name} Variables</h3>
                  <button
                    onClick={handleSaveVariables}
                    disabled={isSaving}
                    style={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      padding: "6px 12px",
                      borderRadius: "var(--radius-md)",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <Save size={14} />
                    {isSaving ? "Saving..." : "Save Variables"}
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                  <KeyValueTable rows={localVars} onChange={setLocalVars} showTypeToggle={false} />
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                Select an environment to view variables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
