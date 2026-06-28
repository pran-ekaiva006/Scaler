"use client";

import { useEffect, useState } from "react";
import { useCollectionsStore } from "@/store/collectionsStore";

export default function ServerWakeupBanner() {
  const isLoading = useCollectionsStore((state) => state.isLoading);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      // If still loading after 3 seconds, the Render backend is probably asleep
      timeout = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    } else {
      // If it finished loading, instantly hide the banner
      setShowBanner(false);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#1c1c1c", // Dark background to match app theme
        color: "#d4d4d4",
        zIndex: 99999, // Ensure it sits above absolutely everything
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #ff6c37",
          borderBottomColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div style={{ fontSize: "16px", fontWeight: 500 }}>
        Waking up backend server...
      </div>
      <div style={{ fontSize: "13px", color: "#888" }}>
        Render free-tier instances may take up to 50 seconds to spin up.
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
