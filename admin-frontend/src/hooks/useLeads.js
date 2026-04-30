import { useState, useEffect } from "react";
import { apiFetch } from "../config/api";
import { getInitials, LEAD_COLORS } from "../utils/helpers";

export function useLeads(token, shouldFetch) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shouldFetch) return;
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/api/contact", { token });
        const messages = Array.isArray(data.messages) ? data.messages : [];
        const mapped = messages.map((item, idx) => {
          const name = item.fullName || "Unknown Lead";
          const phone =
            typeof item.phoneNumber === "string"
              ? item.phoneNumber.trim()
              : typeof item.phone === "string"
                ? item.phone.trim()
                : "";
          return {
            id: item.id || `lead-${idx}`,
            name,
            initials: getInitials(name),
            color: LEAD_COLORS[idx % LEAD_COLORS.length],
            stage: "new",
            phone,
            email: item.email || "",
            note: item.message || "",
            createdAt: item.createdAt || null,
          };
        });
        if (!cancelled) setLeads(mapped);
      } catch (err) {
        if (!cancelled) {
          setLeads([]);
          setError(err.message || "Could not reach the leads API.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [token, shouldFetch]);

  return { leads, setLeads, loading, error };
}