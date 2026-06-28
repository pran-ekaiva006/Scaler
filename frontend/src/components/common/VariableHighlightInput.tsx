import React, { useState, useRef, useEffect } from "react";
import { useEnvironmentsStore } from "@/store/environmentsStore";

interface VariableHighlightInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export default function VariableHighlightInput({ value, onChange, style, onFocus, onBlur, ...props }: VariableHighlightInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const getActiveVariables = useEnvironmentsStore((state) => state.getActiveVariables);
  const inputRef = useRef<HTMLInputElement>(null);

  // We need to trigger the consumer's onFocus/onBlur if passed
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const handleDivClick = () => {
    setIsFocused(true);
    // Use a timeout to ensure React state updates and the input renders before we focus it
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const renderHighlightedText = () => {
    if (!value) return <span style={{ color: "var(--text-muted)" }}>{props.placeholder || ""}</span>;

    const activeVars = getActiveVariables();
    const regex = /(\{\{.*?\}\})/g;
    const parts = value.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const key = part.slice(2, -2).trim();
        const exists = activeVars.hasOwnProperty(key);
        
        return (
          <span
            key={index}
            style={{
              color: exists ? "var(--accent-orange)" : "var(--status-client-error)",
              background: exists ? "rgba(255, 107, 43, 0.1)" : "rgba(220, 38, 38, 0.1)",
              padding: "0 2px",
              borderRadius: "2px",
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Base styling that needs to be identical for both input and div
  const baseStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    padding: "0 12px",
    background: "var(--bg-input)",
    border: "none",
    color: "white",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    ...style,
  };

  if (isFocused) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={baseStyle}
        {...props}
      />
    );
  }

  return (
    <div
      onClick={handleDivClick}
      style={{
        ...baseStyle,
        display: "flex",
        alignItems: "center",
        cursor: "text",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
    >
      {renderHighlightedText()}
    </div>
  );
}
