import bcrypt from 'bcryptjs';
import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt.js';

function sanitizeUser(user) {
  const { passwordHash, refreshToken, ...safe } = user;
  return safe;
}

export async function registerUser(data) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
  });
  if (existing) throw new AppError('Email or phone already registered', 409, 'CONFLICT');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: data.role ?? 'USER',
      skillLevel: data.skillLevel,
      preferredSports: data.preferredSports ?? [],
      location: data.location,
    },
  });

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
}

export async function refreshTokens(refreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH');
  }

  return issueTokens(user);
}

async function issueTokens(user) {
  const payload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
}
