// Imports
import API from './api';

// Type-to-room mapping
const TYPE_TO_ROOM_MAPPING = {
  focus_suite: {
    capacityMin: 2,
    capacityMax: 4,
    keywords: ['focus', 'suite', 'private office'],
  },
  boardroom: {
    capacityMin: 8,
    capacityMax: 14,
    keywords: ['boardroom', 'meeting'],
  },
  adr_suite: {
    capacityMin: 6,
    capacityMax: 10,
    keywords: ['adr', 'mediation', 'arbitration'],
  },
  day_workspace: {
    capacityMin: 1,
    capacityMax: 6,
    keywords: ['day workspace', 'desk', 'flexible'],
  },
};

// Booking service
export const bookingService = {
  
  // Check availability for a specific room
  checkAvailability: async (roomId, date, slot) => {
    try {
      const res = await API.get('/api/bookings/availability', {
        params: {
          roomId,
          date,
          slot: slot.toUpperCase(),
        },
      });
      return res.data;
    } catch (error) {
      console.error('Error checking availability:', error.response?.data || error.message);
      throw error;
    }
  },

  // Find available room for a given type
  findAvailableRoom: async (typeId, date, slot, allRooms) => {
    try {
      const typeSpec = TYPE_TO_ROOM_MAPPING[typeId];
      
      if (!typeSpec) {
        throw new Error(`Unknown reservation type: ${typeId}`);
      }

      // Filter rooms matching the type
      const matchingRooms = allRooms.filter(room => {
        const capacityMatch = 
          room.capacity >= typeSpec.capacityMin && 
          room.capacity <= typeSpec.capacityMax;
        
        const nameMatch = typeSpec.keywords.some(keyword =>
          room.name.toLowerCase().includes(keyword)
        );
        
        const isActive = room.is_active || room.isActive;
        
        return (capacityMatch || nameMatch) && isActive;
      });

      if (matchingRooms.length === 0) {
        return null;
      }

      // Check availability for each matching room
      for (const room of matchingRooms) {
        try {
          const availability = await bookingService.checkAvailability(
            room.id,
            date,
            slot
          );
          
          if (availability.available) {
            return { roomId: room.id, roomName: room.name };
          }
        } catch (error) {
          console.error(`Error checking availability for room ${room.id}:`, error);
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding available room:', error.message);
      throw error;
    }
  },

  // Create booking
  createBooking: async (roomId, date, slot) => {
    try {
      const res = await API.post('/api/bookings', {
        roomId,
        date,
        slot: slot.toUpperCase(),
      });
      return res.data.booking;
    } catch (error) {
      if (error.response?.status === 409) {
        throw new Error('This slot was just booked. Please choose another.');
      }
      if (error.response?.status === 403) {
        throw new Error('You must upload an approved qualification document first.');
      }
      if (error.response?.status === 404) {
        throw new Error('Room not found.');
      }
      console.error('Error creating booking:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Booking failed');
    }
  },

  // Get alternative time slots
  getSuggestedAlternatives: async (typeId, date, slot, allRooms) => {
    try {
      const alternatives = {
        differentTimes: [],
      };

      const timeSlots = ['MORNING', 'AFTERNOON', 'EVENING'];
      
      for (const altSlot of timeSlots) {
        if (altSlot === slot.toUpperCase()) continue;
        
        const available = await bookingService.findAvailableRoom(typeId, date, altSlot, allRooms);
        if (available) {
          alternatives.differentTimes.push({
            slot: altSlot,
            roomName: available.roomName,
          });
        }
      }

      return alternatives;
    } catch (error) {
      console.error('Error getting suggested alternatives:', error.message);
      throw error;
    }
  },

  // Initiate payment
  initiatePayment: async (bookingId) => {
    try {
      const res = await API.post('/api/payments/initiate', {
        bookingId,
      });
      return res.data;
    } catch (error) {
      console.error('Error initiating payment:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const res = await API.get(`/api/bookings/${bookingId}`);
      return res.data.booking;
    } catch (error) {
      console.error('Error fetching booking:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get user's bookings
  getMyBookings: async () => {
    try {
      const res = await API.get('/api/bookings/my-bookings');
      return res.data.bookings;
    } catch (error) {
      console.error('Error fetching your bookings:', error.response?.data || error.message);
      throw error;
    }
  },
};