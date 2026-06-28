"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { KeyValueRow } from "@/lib/types";

interface KeyValueTableProps {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
}

export default function KeyValueTable({ rows, onChange }: KeyValueTableProps) {
  // Always ensure there's at least one empty row at the bottom visually
  const displayRows = [...rows, { key: "", value: "", enabled: true }];

  const handleChange = (index: number, field: keyof KeyValueRow, value: string | boolean) => {
    const isNewRow = index === rows.length;
    
    if (isNewRow) {
      // If they type in the empty row, add it to the real rows array
      if (value !== "") {
        const newRow: KeyValueRow = { key: "", value: "", enabled: true, [field]: value };
        onChange([...rows, newRow]);
      }
      return;
    }

    // Update existing row
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    
    // Auto-enable if it was disabled and they typed something
    if (field !== "enabled" && newRows[index].enabled === false && value) {
      newRows[index].enabled = true;
    }

    onChange(newRows);
  };

  const handleDelete = (index: number) => {
    if (index === rows.length) return; // Can't delete the empty placeholder row
    const newRows = [...rows];
    newRows.splice(index, 1);
    onChange(newRows);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
      {displayRows.map((row, index) => {
        const isPlaceholder = index === rows.length;
        return (
          <div
            key={index}
            style={{
              display: "flex",
              borderBottom: isPlaceholder ? "none" : "1px solid var(--border-subtle)",
              background: isPlaceholder ? "var(--bg-panel)" : "var(--bg-input)",
              opacity: row.enabled === false ? 0.6 : 1,
            }}
          >
            {/* Checkbox cell */}
            <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid var(--border-subtle)" }}>
              <input
                type="checkbox"
                checked={row.enabled !== false}
                onChange={(e) => handleChange(index, "enabled", e.target.checked)}
                disabled={isPlaceholder}
                style={{ cursor: isPlaceholder ? "default" : "pointer" }}
              />
            </div>
            
            {/* Key cell */}
            <div style={{ flex: 1, borderRight: "1px solid var(--border-subtle)" }}>
              <input
                type="text"
                placeholder="Key"
                value={row.key}
                onChange={(e) => handleChange(index, "key", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: 12,
                }}
              />
            </div>
            
            {/* Value cell */}
            <div style={{ flex: 1, borderRight: "1px solid var(--border-subtle)" }}>
              <input
                type="text"
                placeholder="Value"
                value={row.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-primary)",
                  outline: "none",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                }}
              />
            </div>

            {/* Delete button */}
            <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {!isPlaceholder && (
                <button
                  onClick={() => handleDelete(index)}
                  style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  title="Remove row"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
