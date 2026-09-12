import React from "react";

export function Avatar({ name = "?", color = "#0055FF", size = 36, status, showStatus = false, ring = false, testid }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="relative inline-block shrink-0" data-testid={testid}>
      <div
        className={`flex items-center justify-center rounded-full font-semibold ${ring ? "ring-2 ring-white/10" : ""}`}
        style={{ width: size, height: size, background: color, color: "#fff", fontSize: size * 0.4 }}
      >
        {initials || "?"}
      </div>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-[#09090B] ${
            status === "online" ? "online-dot bg-emerald-500" : "bg-zinc-600"
          }`}
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      )}
    </div>
  );
}
