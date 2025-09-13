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

// School Contact Information
export const SCHOOL_CONTACT = {
  address: {
    street: "Udaipur street",
    city: "Knowledge City",
    state: "KC",
    zipCode: "12345",
    full: "Knowledge City, KC 12345"
  },
  phone: {
    main: "+919999999999",
    principal: "+919999999998",
    admissions: "+919999999997"
  },
  email: {
    general: "info@nscbschool.edu",
    admissions: "admissions@nscbschool.edu",
    principal: "principal@nscbschool.edu"
  },
  hours: {
    classes: "Monday - Friday: 8:00 AM - 3:00 PM",
    office: "Monday - Friday: 7:30 AM - 4:00 PM",
    general: "Monday - Friday: 8:00 AM - 4:00 PM"
  },
  social: {
    facebook: "#",
    twitter: "#",
    instagram: "#",
    linkedin: "#"
  }
};

// School Information
export const SCHOOL_INFO = {
  description: "Empowering students with knowledge, character, and leadership skills for over 30 years. Building tomorrow's leaders today.",
  establishedYear: 1994,
  motto: "Excellence in Education",
  principalMessage: "Welcome to our school community where every student matters."
};

// Navigation Links
export const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Academics", path: "/academics" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" }
];

// Quick Links for Footer
export const QUICK_LINKS = [
  { name: "Academics", path: "/academics" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact", path: "/contact" }
];

// Legal Links
export const LEGAL_LINKS = [];

// User Messages
export const USER_MESSAGES = {
  auth: {
    pendingApproval: "Your account is pending admin approval. Please contact the school administration.",
    accountRejected: "Your account has been rejected. Please contact the school administration.",
    rejectedInfo: "Your account application has been rejected. Please contact the school administration for more information.",
    awaitingApproval: "Your account is awaiting admin approval. You will receive an email notification once your account has been reviewed and approved.",
    registrationSuccess: "Your account has been created successfully. Please wait for admin approval before you can sign in. You will receive a confirmation email once your account is approved."
  }
};
