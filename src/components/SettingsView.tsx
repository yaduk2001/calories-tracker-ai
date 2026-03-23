"use client";

import { useRef } from "react";

export type ThemeType = "solid" | "gradient" | "image" | "default";

export interface ThemeConfig {
  type: ThemeType;
  value: string;
}

interface SettingsViewProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
}

export default function SettingsView({ currentTheme, onThemeChange }: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const solidColors = [
    // Neutrals & Darks
    "#000000", "#09090b", "#18181b", "#3f3f46", 
    // Blues
    "#0f172a", "#172554", "#1e3a8a", "#2563eb", "#0284c7",
    // Greens
    "#052e16", "#14532d", "#16a34a", "#0f766e",
    // Purples & Pinks
    "#2e1065", "#4c1d95", "#7e22ce", "#9333ea", 
    "#831843", "#be185d", "#db2777",
    // Reds & Warm
    "#7f1d1d", "#b91c1c", "#ea580c", "#ca8a04"
  ];

  const gradients = [
    // Hyper Vibrant
    "linear-gradient(135deg, #ec4899 0%, #3b82f6 100%)", // Pink to Blue
    "linear-gradient(135deg, #f97316 0%, #9333ea 100%)", // Sunset Orange to Purple
    "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)", // Emerald to Teal
    "linear-gradient(135deg, #eab308 0%, #db2777 100%)", // Cyberpunk
    "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", // Cyan to Blue
    "linear-gradient(135deg, #ef4444 0%, #f97316 100%)", // Red to Orange
    "linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)", // Rose to Peach
    "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)", // Violet to Blue
    // High-Contrast Darks
    "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", // Deep Indigo to Bright Purple
    "linear-gradient(135deg, #020617 0%, #334155 100%)", // Pitch Black to Light Slate
    "linear-gradient(135deg, #064e3b 0%, #14b8a6 100%)", // Dark Emerald to Bright Teal
    "linear-gradient(135deg, #450a0a 0%, #ef4444 100%)", // Pitch Red to Bright Red
    "linear-gradient(135deg, #0f172a 0%, #171717 100%)"  // Slate to Charcoal
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onThemeChange({ type: "image", value: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", width: "100%", color: "var(--text-primary)", animation: "fadeIn 0.3s ease" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: "2rem", fontWeight: 700, letterSpacing: "-1px" }}>App Settings</h1>

      <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", fontWeight: 600, borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
          Appearance & Themes
        </h2>

        {/* Solid Colors */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Solid Colors</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {solidColors.map(color => (
              <button
                key={color}
                onClick={() => onThemeChange({ type: "solid", value: color })}
                style={{
                  width: "50px", height: "50px", borderRadius: "12px", background: color,
                  border: currentTheme.value === color ? "3px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer", transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Gradients */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Gradients</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {gradients.map(grad => (
              <button
                key={grad}
                onClick={() => onThemeChange({ type: "gradient", value: grad })}
                style={{
                  width: "80px", height: "50px", borderRadius: "12px", background: grad,
                  border: currentTheme.value === grad ? "3px solid var(--accent-color)" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer", transition: "transform 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            ))}
          </div>
        </div>

        {/* Custom Image */}
        <div>
          <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Custom Background Image</h3>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: "0.75rem 1.5rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--glass-border)",
                color: "var(--text-primary)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 500,
                transition: "background 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              Upload Local Image
            </button>
            {currentTheme.type === "image" && (
              <span style={{ color: "#10b981", fontSize: "0.9rem", fontWeight: 600 }}>
                ✓ Custom Image Applied
              </span>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: "3rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
           <button 
            onClick={() => onThemeChange({ type: "default", value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" })}
            style={{
              padding: "0.5rem 1rem", background: "transparent", border: "none",
              color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem"
            }}
          >
            Reset completely to Default
          </button>
        </div>
      </div>
    </div>
  );
}
