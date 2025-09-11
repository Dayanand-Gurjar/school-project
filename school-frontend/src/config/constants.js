export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || "NSCB School";
export const LOGO_URL = import.meta.env.VITE_LOGO_URL || "/logo.png";
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Modern Color Theme - Deep Blue & Gold Academia
export const THEME = {
  primary: "#1e3a8a", // Deep blue
  primaryHover: "#1d4ed8",
  secondary: "#f59e0b", // Golden amber
  secondaryHover: "#d97706",
  accent: "#10b981", // Emerald green
  accentHover: "#059669",
  dark: "#0f172a", // Slate dark
  light: "#f8fafc", // Slate light
  gray: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a"
  },
  gradients: {
    primary: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    secondary: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    hero: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #1e40af 100%)"
  }
};

// Navigation Links
export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Academics", path: "/academics" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" }
];
