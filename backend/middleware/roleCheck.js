// Role check middleware
const requireAdmin = (req, res, next) => {
  // Temporary - Paul will replace with real role checking
  console.log('Role check - allowing all requests for now');
  next();
};

module.exports = { requireAdmin };
