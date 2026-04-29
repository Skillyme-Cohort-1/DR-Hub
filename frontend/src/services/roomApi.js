// Imports
import API from "./api";

// Room service
export const roomService = {

    // Get all rooms
    getAllRooms: async () => {
        try {
            const res = await API.get('/rooms');
            return res.data;
        } catch (error) {
            console.error('Error fetching rooms:', error.response?.data || error.message);
            throw error;
        }
    },

    // Fetch room by id
    getRoomById: async (id) => {
        try {
            const res = await API.get(`/rooms/${id}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching room by id:', error.response?.data || error.message);
            throw error;
        }
    }
};