const prisma = require('../lib/prisma');
const { verifyAccessToken } = require('../lib/auth');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is required.' });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'User account is not active.' });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  if (req.authUser.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access is required.' });
  }

  return next();
}

function requireSelfOrAdmin(req, res, next) {
  if (!req.authUser) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  const { id } = req.params;
  if (req.authUser.role !== 'ADMIN' && req.authUser.id !== id) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }

  return next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireSelfOrAdmin,
};
