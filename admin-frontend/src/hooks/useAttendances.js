import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../config/api";

export function useAttendances(token, shouldFetch) {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAttendances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/attendances", { token });
      setAttendances(data || []);
    } catch (err) {
      setError(err.message || "Could not reach attendances API.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!shouldFetch) return;
    fetchAttendances();
  }, [shouldFetch, fetchAttendances]);

  return { attendances, loading, error, refetch: fetchAttendances };
}