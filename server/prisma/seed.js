import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LUCKNOW_VENUES = [
  {
    name: 'Smash Arena Badminton',
    sportType: 'badminton',
    area: 'Gomti Nagar',
    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    latitude: 26.8496,
    longitude: 81.0062,
    openingTime: '06:00',
    closingTime: '22:00',
    courts: [{ name: 'Court 1', type: 'indoor', pricePerHour: 450, maxPlayers: 4 }],
  },
  {
    name: 'KickOff Chinhat Turf',
    sportType: 'football',
    area: 'Chinhat',
    address: 'Chinhat, Lucknow',
    latitude: 26.8842,
    longitude: 81.0284,
    openingTime: '05:00',
    closingTime: '23:00',
    courts: [{ name: 'Full Turf', type: 'turf', pricePerHour: 2200, maxPlayers: 14 }],
  },
  {
    name: 'SAI Swimming Complex',
    sportType: 'swimming',
    area: 'SAI Lucknow',
    address: 'Sector 9, Gomti Nagar Extension, Lucknow',
    latitude: 26.8711,
    longitude: 81.0203,
    openingTime: '06:00',
    closingTime: '20:00',
    courts: [{ name: 'Olympic Pool Lane', type: 'pool', pricePerHour: 350, maxPlayers: 8 }],
  },
  {
    name: 'Net Masters Cricket Nets',
    sportType: 'cricket',
    area: 'Aliganj',
    address: 'Aliganj, Lucknow',
    latitude: 26.8889,
    longitude: 80.9389,
    openingTime: '06:00',
    closingTime: '21:00',
    courts: [{ name: 'Net A', type: 'net', pricePerHour: 500, maxPlayers: 6 }],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@playsetu.in' },
    update: {},
    create: {
      name: 'PlaySetu Admin',
      email: 'admin@playsetu.in',
      passwordHash,
      role: 'ADMIN',
      location: 'Hazratganj',
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@playsetu.in' },
    update: {},
    create: {
      name: 'Lucknow Sports Owner',
      email: 'owner@playsetu.in',
      passwordHash,
      role: 'OWNER',
      location: 'Gomti Nagar',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@playsetu.in' },
    update: {},
    create: {
      name: 'Demo Player',
      email: 'user@playsetu.in',
      passwordHash,
      role: 'USER',
      skillLevel: 'intermediate',
      preferredSports: ['badminton', 'football'],
      location: 'Gomti Nagar',
      latitude: 26.85,
      longitude: 81.01,
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(tomorrow.toISOString().slice(0, 10));

  for (const venue of LUCKNOW_VENUES) {
    const facility = await prisma.facility.create({
      data: {
        name: venue.name,
        description: `${venue.name} — book on PlaySetu`,
        sportType: venue.sportType,
        address: venue.address,
        area: venue.area,
        latitude: venue.latitude,
        longitude: venue.longitude,
        ownerId: owner.id,
        rating: 4.2,
        openingTime: venue.openingTime,
        closingTime: venue.closingTime,
        status: 'ACTIVE',
        courts: {
          create: venue.courts,
        },
      },
      include: { courts: true },
    });

    for (const court of facility.courts) {
      await prisma.slot.createMany({
        data: [
          { courtId: court.id, date: dateOnly, startTime: '18:00', endTime: '19:00', availability: 'AVAILABLE' },
          { courtId: court.id, date: dateOnly, startTime: '19:00', endTime: '20:00', availability: 'AVAILABLE' },
          { courtId: court.id, date: dateOnly, startTime: '20:00', endTime: '21:00', availability: 'AVAILABLE' },
        ],
        skipDuplicates: true,
      });
    }
  }

  console.log('Seed complete:', { admin: admin.email, owner: owner.email, user: user.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
