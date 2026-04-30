import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../config/api";
import { mapApiBookingToDashboardBooking } from "../utils/helpers";

export function useBookings(token) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    if (!token) {
      setError("Authentication token is missing.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/bookings", { token });
      const list = Array.isArray(data.bookings) ? data.bookings : [];
      setBookings(list.map((item, idx) => mapApiBookingToDashboardBooking(item, idx)));
    } catch (err) {
      setError(err.message || "Could not reach the bookings API.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, setBookings, loading, error, refetch: fetchBookings };
}