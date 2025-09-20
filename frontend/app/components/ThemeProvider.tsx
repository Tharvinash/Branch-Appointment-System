"use client";

import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <div className="toyota-gazoo-racing-theme">{children}</div>;
}

// Export theme constants for use in components
export const TOYOTA_THEME = {
  colors: {
    primary: "#EB0A1E",
    primaryDark: "#C00015",
    secondary: "#000000",
    background: "#FFFFFF",
    surface: "#F5F5F5",
    surfaceDark: "#E5E5E5",
    textPrimary: "#000000",
    textSecondary: "#666666",
    textWhite: "#FFFFFF",
  },
  fonts: {
    primary: "Inter, system-ui, -apple-system, sans-serif",
    mono: "Geist Mono, monospace",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
} as const;
