"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Theme = "default" | "forbidden-forest";

interface SortingHatThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isForbiddenForest: boolean;
}

// ─── Theme colors ────────────────────────────────────────────────────────────

const FORBIDDEN_FOREST_COLORS = {
  background: "#0a0f0a",
  foreground: "#d4e6d4",
  card: "#0f1a0f",
  cardForeground: "#d4e6d4",
  primary: "#2d5a2d",
  primaryForeground: "#d4e6d4",
  secondary: "#1a3a1a",
  secondaryForeground: "#a8c8a8",
  muted: "#1a2a1a",
  mutedForeground: "#7a9a7a",
  accent: "#3a6a3a",
  accentForeground: "#d4e6d4",
  destructive: "#5a2a2a",
  border: "#2a4a2a",
  ring: "#3a6a3a",
};

// ─── Context ─────────────────────────────────────────────────────────────────

const SortingHatThemeContext = createContext<SortingHatThemeContextType>({
  theme: "default",
  setTheme: () => {},
  toggleTheme: () => {},
  isForbiddenForest: false,
});

export function useSortingHatTheme() {
  return useContext(SortingHatThemeContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function SortingHatThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("default");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "default" ? "forbidden-forest" : "default"));
  };

  // Apply theme CSS variables
  useEffect(() => {
    if (theme === "forbidden-forest") {
      const root = document.documentElement;
      const colors = FORBIDDEN_FOREST_COLORS;

      root.style.setProperty("--background", colors.background);
      root.style.setProperty("--foreground", colors.foreground);
      root.style.setProperty("--card", colors.card);
      root.style.setProperty("--card-foreground", colors.cardForeground);
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--primary-foreground", colors.primaryForeground);
      root.style.setProperty("--secondary", colors.secondary);
      root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
      root.style.setProperty("--muted", colors.muted);
      root.style.setProperty("--muted-foreground", colors.mutedForeground);
      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--accent-foreground", colors.accentForeground);
      root.style.setProperty("--destructive", colors.destructive);
      root.style.setProperty("--border", colors.border);
      root.style.setProperty("--ring", colors.ring);

      // Add forest atmosphere
      root.classList.add("forbidden-forest");
    } else {
      // Reset to default theme
      const root = document.documentElement;
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--secondary-foreground");
      root.style.removeProperty("--muted");
      root.style.removeProperty("--muted-foreground");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--accent-foreground");
      root.style.removeProperty("--destructive");
      root.style.removeProperty("--border");
      root.style.removeProperty("--ring");

      root.classList.remove("forbidden-forest");
    }
  }, [theme]);

  return (
    <SortingHatThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isForbiddenForest: theme === "forbidden-forest",
      }}
    >
      {children}
    </SortingHatThemeContext.Provider>
  );
}

// ─── Theme toggle button ─────────────────────────────────────────────────────

export function ForbiddenForestToggle() {
  const { isForbiddenForest, toggleTheme } = useSortingHatTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-all duration-300 ease-in-out
        ${
          isForbiddenForest
            ? "bg-green-900/50 text-green-200 hover:bg-green-800/50 border border-green-700"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }
      `}
      title={isForbiddenForest ? "Switch to default theme" : "Enter the Forbidden Forest"}
    >
      {isForbiddenForest ? (
        <>
          <span>🌲</span>
          <span>Forbidden Forest</span>
          <span className="text-xs opacity-60">🌙</span>
        </>
      ) : (
        <>
          <span>🌳</span>
          <span>Forbidden Forest</span>
        </>
      )}
    </button>
  );
}
