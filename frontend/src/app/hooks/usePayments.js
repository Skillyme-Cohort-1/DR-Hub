import { useState, useEffect } from "react";
import { getStoredAccessToken, API_BASE } from "../lib/auth";

export function usePayments() {
  const [myPayments, setMyPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState("");

  useEffect(() => {
    fetchMyPayments();
  }, []);

  const fetchMyPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError("");
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setMyPayments([]);
        setPaymentsError("No access token found. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/payments`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch payments");
      }

      setMyPayments(Array.isArray(payload?.data) ? payload.data : []);
    } catch (error) {
      setMyPayments([]);
      setPaymentsError("Could not load payments.");
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  return { myPayments, paymentsLoading, paymentsError };
}