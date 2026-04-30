import { useState, useEffect } from "react";
import { getStoredAccessToken, API_BASE } from "../lib/auth";

export function useCheckins() {
  const [checkins, setCheckins] = useState([]);
  const [checkinsLoading, setCheckinsLoading] = useState(true);
  const [checkinsError, setCheckinsError] = useState("");

  useEffect(() => {
    fetchCheckins();
  }, []);

  const fetchCheckins = async () => {
    setCheckinsLoading(true);
    setCheckinsError("");
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setCheckins([]);
        setCheckinsError("No access token found. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/attendances`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch checkins");
      }

      setCheckins(payload ? payload : []);
    } catch (error) {
      setCheckins([]);
      setCheckinsError("Could not load checkins.");
      console.error("Error fetching checkins:", error);
    } finally {
      setCheckinsLoading(false);
    }
  };

  return { checkins, checkinsLoading, checkinsError };
}