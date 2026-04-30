import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../config/api";

export function useUsers(token, shouldFetch) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => setReloadKey((v) => v + 1), []);

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
        const data = await apiFetch("/api/users", { token });
        if (!cancelled) setUsers(Array.isArray(data.users) ? data.users : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not reach the users API.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [token, shouldFetch, reloadKey]);

  return { users, loading, error, reload };
}