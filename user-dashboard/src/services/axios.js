import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://new-con-back.lexicron.org/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Endpoints that must never trigger a global logout when they return 401.
// A 401 on these simply means "invalid/expired credentials for THIS attempt",
// not "the current session is dead".
const AUTH_EXEMPT_PATHS = [
  "/auth/login",
  "/login",
  "/auth/register",
  "/register",
  "/logout",
  "/forgot-password",
  "/forgot-password-otp",
  "/verify-otp",
  "/verify-email-code",
  "/resend-verification-code",
  "/reset-password",
  "/reset-password-with-otp",
];

const isExemptPath = (url = "") => {
  const path = url.split("?")[0];
  return AUTH_EXEMPT_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
};

// Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally, but only when the request was
// actually an authenticated one. This prevents harmless/transient 401s (or
// 401s from auth/public endpoints) from wiping a valid session on page reload.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hadToken = !!localStorage.getItem("token");
    const sentAuthHeader = !!error.config?.headers?.Authorization;

    const isGenuineSessionExpiry =
      status === 401 &&
      hadToken &&
      sentAuthHeader &&
      !isExemptPath(url);

    if (isGenuineSessionExpiry) {
      // Dispatch a custom event; App.jsx listens and handles the redirect via
      // React Router (respects the app's base path, no full-page hard reload).
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

