// Imports
// Node.js 18+ has built-in fetch, no need for node-fetch

// In-memory cache with TTL
let reviewsCache = null;
let cacheTime = 0;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Helper: Normalize Google Places review to consistent format
const normalizeReview = (review, placeId) => {
  return {
    name: review.author_name || 'Anonymous',
    role: 'Google Reviews',
    quote: review.text || '',
    rating: review.rating || 0,
    time: review.relative_time_description || 'Recently',
    sourceUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
  };
};

// Controller: Get live Google reviews
exports.getGoogleReviews = async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = process.env.GOOGLE_PLACE_ID;

    if (!apiKey || !placeId) {
      return res.status(400).json({
        message: 'Google API credentials not configured',
        reviews: [],
      });
    }

    // Return cached if valid
    if (reviewsCache && Date.now() - cacheTime < CACHE_TTL) {
      return res.status(200).json({
        message: 'Reviews retrieved successfully (cached)',
        reviews: reviewsCache,
        cached: true,
      });
    }

    // Fetch from Google Places API
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,reviews&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google API responded with ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.error_message);
      return res.status(200).json({
        message: 'Unable to fetch live reviews, returning fallback',
        reviews: [],
      });
    }

    if (!data.result || !data.result.reviews || data.result.reviews.length === 0) {
      return res.status(200).json({
        message: 'No reviews found for this location',
        reviews: [],
      });
    }

    // Normalize and limit to 5 reviews
    const reviews = data.result.reviews
      .slice(0, 5)
      .map((rv) => normalizeReview(rv, placeId));

    // Cache the result
    reviewsCache = reviews;
    cacheTime = Date.now();

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      reviews,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching Google reviews:', error.message);
    res.status(500).json({
      message: 'Error fetching reviews',
      error: error.message,
      reviews: [],
    });
  }
};

// Controller: Clear cache (admin only, useful for testing)
exports.clearReviewsCache = async (req, res) => {
  try {
    reviewsCache = null;
    cacheTime = 0;
    res.status(200).json({ message: 'Reviews cache cleared successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error clearing cache',
      error: error.message,
    });
  }
};
