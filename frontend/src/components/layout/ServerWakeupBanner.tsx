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
      }, 3000);
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
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#ff6c37", // Postman orange
        color: "white",
        textAlign: "center",
        padding: "8px",
        fontSize: "14px",
        fontWeight: 500,
        zIndex: 9999, // Ensure it sits above the TopBar
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          width: "16px",
          height: "16px",
          border: "2px solid white",
          borderBottomColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      Waking up free-tier backend server... (this usually takes 15-50 seconds)
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
