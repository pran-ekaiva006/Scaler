import React from "react";

export default function PrettyView({ body, isJson }: { body: string; isJson: boolean }) {
  if (!isJson) {
    return (
      <div style={{ flex: 1, padding: 16, overflow: "auto", background: "var(--bg-panel)" }}>
        <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-primary)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {body}
        </pre>
      </div>
    );
  }

  // Very lightweight syntax highlighter for JSON
  const syntaxHighlight = (json: string) => {
    let parsed: any;
    try {
      parsed = JSON.parse(json);
      json = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // not valid json string, return as is
      return json;
    }
    
    // Regex for basic JSON syntax highlighting
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let color = "var(--text-primary)"; // default
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = "#e06c75"; // keys (red-ish)
        } else {
          color = "#98c379"; // strings (green)
        }
      } else if (/true|false|null/.test(match)) {
        color = "#d19a66"; // booleans, null (orange)
      } else if (/^-?\d/.test(match)) {
        color = "#61afef"; // numbers (blue)
      }
      return `<span style="color: ${color}">${match}</span>`;
    });
  };

  return (
    <div style={{ flex: 1, padding: 16, overflow: "auto", background: "var(--bg-panel)" }}>
      <pre 
        style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" }}
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(body) }}
      />
    </div>
  );
}
