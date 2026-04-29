import { useState, useEffect, useMemo } from "react";
import { getStoredAccessToken, API_BASE } from "../lib/auth";
import { formatCurrency } from "../lib/formatters";

export function useBookings() {
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const token = getStoredAccessToken();
      if (!token) {
        setMyBookings([]);
        setBookingsError("No access token found. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to fetch bookings");
      }

      setMyBookings(Array.isArray(payload?.bookings) ? payload.bookings : []);
    } catch (error) {
      setMyBookings([]);
      setBookingsError("Could not load bookings.");
      console.error("Error fetching bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return myBookings
      .filter((booking) => {
        const bookingDate = new Date(booking?.date);
        return !Number.isNaN(bookingDate.getTime()) && bookingDate >= today;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [myBookings]);

  const stats = useMemo(() => {
    const completed = myBookings.filter(
      (booking) => booking.status === "CONFIRMED" || booking.status === "COMPLETED",
    ).length;
    const totalSpent = myBookings.reduce(
      (sum, booking) => sum + Number(booking.amountCharged || 0),
      0,
    );

    return {
      totalBookings: myBookings.length,
      upcomingSessions: upcomingBookings.length,
      completed,
      totalSpent: formatCurrency(totalSpent),
    };
  }, [myBookings, upcomingBookings]);

  return {
    myBookings,
    bookingsLoading,
    bookingsError,
    upcomingBookings,
    stats,
  };
}