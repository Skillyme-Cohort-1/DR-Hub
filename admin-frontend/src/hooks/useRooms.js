import { useState, useCallback } from "react";
import { apiFetch } from "../config/api";

export function useRooms(token) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/rooms");
      if (data.success) setRooms(data.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoom = useCallback(async (roomData) => {
    const res = await apiFetch("/api/rooms", {
      token,
      method: "POST",
      body: {
        name: roomData.name,
        capacity: parseInt(roomData.capacity),
        cost: parseFloat(roomData.cost),
        description: roomData.description,
      },
    });
    if (res.success) {
      fetchRooms();
      return true;
    }
    throw new Error(res.message || "Failed to create room.");
  }, [token, fetchRooms]);

  const updateRoom = useCallback(async (roomId, roomData) => {
    const res = await apiFetch(`/api/rooms/${roomId}`, {
      token,
      method: "PUT",
      body: {
        name: roomData.name,
        capacity: parseInt(roomData.capacity),
        cost: parseFloat(roomData.cost),
        description: roomData.description,
      },
    });
    if (res.success) {
      fetchRooms();
      return true;
    }
    throw new Error(res.message || "Failed to update room.");
  }, [token, fetchRooms]);

  const deleteRoom = useCallback(async (roomId) => {
    const res = await apiFetch(`/api/rooms/${roomId}`, { token, method: "DELETE" });
    if (res.success) {
      fetchRooms();
      return true;
    }
    throw new Error(res.message || "Failed to delete room.");
  }, [token, fetchRooms]);

  return { rooms, loading, fetchRooms, createRoom, updateRoom, deleteRoom };
}