import { prisma } from '../../config/db.js';
import { AppError } from '../../shared/errors/AppError.js';

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      skillLevel: true,
      preferredSports: true,
      location: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

export async function updateProfile(userId, data) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone,
      skillLevel: data.skillLevel,
      preferredSports: data.preferredSports,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      skillLevel: true,
      preferredSports: true,
      location: true,
      latitude: true,
      longitude: true,
    },
  });
}
