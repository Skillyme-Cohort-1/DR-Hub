const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { signAccessToken, generateResetToken, hashToken } = require('../lib/auth');
const { sendActivationEmail } = require('../../emails');

const PASSWORD_MIN_LENGTH = 8;
const BCRYPT_ROUNDS = 12;
const ALLOWED_ROLES = ['ADMIN', 'MEMBER'];
const ALLOWED_GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const ALLOWED_STATUSES = ['ACTIVE', 'INACTIVE'];
const ACTIVATION_TOKEN_EXPIRES_HOURS = Number(process.env.ACTIVATION_TOKEN_EXPIRES_HOURS || 24);

function getActivationUrl(rawToken) {
  const baseUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`;
  const url = new URL('/api/users/activate-account', baseUrl);
  url.searchParams.set('token', rawToken);
  return url.toString();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    address: user.address,
    city: user.city,
    country: user.country,
    occupation: user.occupation,
    status: user.status,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required.' });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }

    const normalizedRole = String(role).trim().toUpperCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        role: normalizedRole,
        passwordHash,
        status: 'INACTIVE',
      },
    });

    const rawActivationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenHash = hashToken(rawActivationToken);
    const activationExpiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRES_HOURS * 60 * 60 * 1000);

    await prisma.accountActivationToken.create({
      data: {
        tokenHash: activationTokenHash,
        expiresAt: activationExpiresAt,
        userId: user.id,
      },
    });

    try {
      const result = await sendActivationEmail({
        to: user.email,
        name: user.name,
        activationUrl: getActivationUrl(rawActivationToken),
      });

      if (!result.ok) {
        console.warn(`Activation email skipped: ${result.reason}`);
      }
    } catch (mailError) {
      // Do not fail registration if email sending fails.
      console.error('Failed to send activation email:', mailError.message);
    }

    return res.status(201).json({
      message: 'Registration successful. Please check your email to activate your account.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is inactive. Please activate your account from your email.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signAccessToken(user);
    return res.status(200).json({ message: 'Login successful.', token, user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function activateAccount(req, res, next) {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Activation token is required.' });
    }

    const tokenHash = hashToken(String(token));
    const activationToken = await prisma.accountActivationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !activationToken ||
      activationToken.usedAt ||
      activationToken.expiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Activation token is invalid or expired.' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: activationToken.userId },
        data: { status: 'ACTIVE' },
      }),
      prisma.accountActivationToken.update({
        where: { id: activationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.status(200).send(
      '<h2>Account activated successfully.</h2><p>You can now return to the app and login.</p>'
    );
  } catch (error) {
    return next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const genericResponse = {
      message: 'If an account exists for this email, a password reset link has been generated.',
    };

    if (!email) {
      return res.status(200).json(genericResponse);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const { rawToken, tokenHash, expiresAt } = generateResetToken();

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        expiresAt,
        userId: user.id,
      },
    });

    return res.status(200).json({
      ...genericResponse,
      resetToken: rawToken,
      expiresAt,
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'token and password are required.' });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }

    const tokenHash = hashToken(String(token));
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Reset token is invalid or expired.' });
    }

    const newPasswordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phoneNumber,
      gender,
      address,
      city,
      country,
      occupation,
      status,
      role,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User id is required.' });
    }

    const data = {};

    if (name !== undefined) data.name = String(name).trim();
    if (email !== undefined) data.email = String(email).trim().toLowerCase();
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber ? String(phoneNumber).trim() : null;
    if (gender !== undefined) data.gender = gender ? String(gender).toUpperCase() : null;
    if (address !== undefined) data.address = address ? String(address).trim() : null;
    if (city !== undefined) data.city = city ? String(city).trim() : null;
    if (country !== undefined) data.country = country ? String(country).trim() : null;
    if (occupation !== undefined) data.occupation = String(occupation).trim();
    if (status !== undefined) data.status = String(status).toUpperCase();
    if (role !== undefined) data.role = String(role).toUpperCase();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    if (data.gender && !ALLOWED_GENDERS.includes(data.gender)) {
      return res.status(400).json({ message: `gender must be one of: ${ALLOWED_GENDERS.join(', ')}` });
    }

    if (data.status && !ALLOWED_STATUSES.includes(data.status)) {
      return res.status(400).json({ message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    if (data.role && !ALLOWED_ROLES.includes(data.role)) {
      return res.status(400).json({ message: `role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    if (data.email) {
      const existingByEmail = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });
      if (existingByEmail) {
        return res.status(409).json({ message: 'Email is already in use by another user.' });
      }
    }

    if (data.phoneNumber) {
      const existingByPhone = await prisma.user.findFirst({
        where: {
          phoneNumber: data.phoneNumber,
          id: { not: id },
        },
      });
      if (existingByPhone) {
        return res.status(409).json({ message: 'Phone number is already in use by another user.' });
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return res.status(200).json({
      message: 'User profile updated successfully.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found.' });
    }
    return next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      message: 'Users fetched successfully.',
      count: users.length,
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    return next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User id is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      message: 'User fetched successfully.',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  activateAccount,
  login,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAllUsers,
  getUserById,
};
