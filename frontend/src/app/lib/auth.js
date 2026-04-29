export const API_BASE = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").replace(/\/$/, "");

export function getStoredAccessToken() {
  const directToken =
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  if (directToken) return directToken;

  const jsonTokenSources = ["auth", "session", "userSession"];
  for (const key of jsonTokenSources) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const nestedToken =
        parsed?.accessToken ||
        parsed?.token ||
        parsed?.authToken ||
        parsed?.data?.accessToken ||
        parsed?.data?.token;

      if (nestedToken) return nestedToken;
    } catch {
      // ignore malformed JSON storage and continue trying other keys
    }
  }

  return "";
}