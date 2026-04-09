// Auth middleware
const authenticateToken = (req, res, next) => {
  // Temporary - Paul will replace with real JWT verification
  console.log('Auth middleware - allowing all requests for now');
  req.user = { role: 'ADMIN' };
  next();
};

module.exports = { authenticateToken };
