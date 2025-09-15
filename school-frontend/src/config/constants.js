export const SCHOOL_NAME = import.meta.env.VITE_SCHOOL_NAME || "NSCB School Udaipur";
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
    street: "Lai Ka Guda, Badi, Badgaon",
    city: "Udaipur",
    state: "Rajasthan",
    zipCode: "313001",
    full: "Lai ka guda, Udaipur, Rajasthan, 313001"
  },
  phone: {
    main: "+919828668406",
    principal: "+919828668406",
    admissions: "+919999999997"
  },
  email: {
    general: "gupsresidential@gmail.com",
    admissions: "gupsresidential@gmail.com",
    principal: "gupsresidential@gmail.com"
  },
  hours: {
    winter: "10:00 AM - 4:00 PM",
    summer: "07:30 AM - 1:00 PM",
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
  description: "A sanctuary of hope and healing, providing education, care, and protection to rescued child laborers, homeless children, and those affected by calamities. Transforming vulnerable lives through compassionate education and residential care.",
  establishedYear: 2011,
  motto: "Every Child Deserves Hope",
  principalMessage: "In our caring embrace, every vulnerable child finds not just education, but a loving home where dreams are nurtured and futures are rebuilt with dignity and hope."
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
