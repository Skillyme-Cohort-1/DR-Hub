// Imports
import API from "./api";

// Reviews service
export const reviewService = {

    // Get reviews (live from Google or fallback to curated)
    getReviews: async () => {
        try {
            const res = await API.get('/api/reviews');
            return res.data;
        } catch (error) {
            console.error('Error fetching reviews:', error.response?.data || error.message);
            throw error;
        }
    },

    // Clear reviews cache (admin only)
    clearReviewsCache: async () => {
        try {
            const res = await API.post('/api/reviews/cache/clear');
            return res.data;
        } catch (error) {
            console.error('Error clearing reviews cache:', error.response?.data || error.message);
            throw error;
        }
    }
};
