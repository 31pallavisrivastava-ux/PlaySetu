import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { getSportPlayerLimits } from '../src/shared/constants/sportPlayerLimits.js';

const prisma = new PrismaClient();

function courtsWithLimits(courts, sportType) {
  const sport = getSportPlayerLimits(sportType);
  return courts.map((c) => ({
    ...c,
    minPlayers: c.minPlayers ?? sport.min,
    maxPlayers: c.maxPlayers ?? sport.max,
  }));
}

/** Venues mapped to LUCKNOW_AREAS in client/src/constants/sports.js */
const LUCKNOW_VENUES = [
  {
    name: 'Smash Arena Badminton',
    sportType: 'badminton',
    area: 'Gomti Nagar',
    address: 'Shop 12, Vibhuti Khand, Gomti Nagar, Lucknow 226010',
    latitude: 26.8496,
    longitude: 81.0062,
    rating: 4.5,
    openingTime: '06:00',
    closingTime: '22:00',
    description:
      'Air-conditioned indoor badminton courts with wooden flooring. Popular for evening leagues in Gomti Nagar.',
    courts: [
      { name: 'Court 1', type: 'indoor', pricePerHour: 450, maxPlayers: 4 },
      { name: 'Court 2', type: 'indoor', pricePerHour: 450, maxPlayers: 4 },
    ],
  },
  {
    name: 'Racket Republic Badminton Hub',
    sportType: 'badminton',
    area: 'Gomti Nagar',
    address: 'Near Fun Republic Mall, Vibhuti Khand, Gomti Nagar, Lucknow',
    latitude: 26.8521,
    longitude: 81.0098,
    rating: 4.3,
    openingTime: '07:00',
    closingTime: '23:00',
    description: 'Multi-court badminton hub with coaching slots on weekends.',
    courts: [{ name: 'Premium Court', type: 'indoor', pricePerHour: 550, maxPlayers: 4 }],
  },
  {
    name: 'Green Valley Football Turf',
    sportType: 'football',
    area: 'Gomti Nagar',
    address: 'Viram Khand, Gomti Nagar, Lucknow',
    latitude: 26.8568,
    longitude: 81.0012,
    rating: 4.4,
    openingTime: '05:30',
    closingTime: '23:30',
    description: '5-a-side and 7-a-side artificial turf with floodlights.',
    courts: [
      { name: '5v5 Turf', type: 'turf', pricePerHour: 1800, maxPlayers: 10 },
      { name: '7v7 Turf', type: 'turf', pricePerHour: 2400, maxPlayers: 14 },
    ],
  },
  {
    name: 'KickOff Chinhat Turf',
    sportType: 'football',
    area: 'Chinhat',
    address: 'Chinhat Industrial Area, Lucknow 226028',
    latitude: 26.8842,
    longitude: 81.0284,
    rating: 4.6,
    openingTime: '05:00',
    closingTime: '23:00',
    description: 'Full-size turf popular for corporate matches and weekend tournaments.',
    courts: [{ name: 'Full Turf', type: 'turf', pricePerHour: 2200, maxPlayers: 14 }],
  },
  {
    name: 'Chinhat Cricket Practice Nets',
    sportType: 'cricket',
    area: 'Chinhat',
    address: 'Faizabad Road, Chinhat, Lucknow',
    latitude: 26.8795,
    longitude: 81.0312,
    rating: 4.1,
    openingTime: '06:00',
    closingTime: '20:00',
    description: 'Bowling machine and side-arm throw-down nets for all age groups.',
    courts: [
      { name: 'Net 1', type: 'net', pricePerHour: 400, maxPlayers: 6 },
      { name: 'Net 2', type: 'net', pricePerHour: 400, maxPlayers: 6 },
    ],
  },
  {
    name: 'Colvin Cricket Academy',
    sportType: 'cricket',
    area: 'Aliganj',
    address: 'University Rd, Purana Haidarabad, Hasanganj, Lucknow 226007',
    latitude: 26.8636,
    longitude: 80.9416,
    rating: 4.8,
    openingTime: '06:00',
    closingTime: '21:00',
    description:
      'Premier Lucknow cricket academy on University Road — turf nets, structured coaching, and match simulation. BCCI-qualified coaches.',
    courts: [
      { name: 'Main Turf Net', type: 'turf', pricePerHour: 600, maxPlayers: 8 },
      { name: 'Academy Net A', type: 'net', pricePerHour: 500, maxPlayers: 6 },
      { name: 'Academy Net B', type: 'net', pricePerHour: 500, maxPlayers: 6 },
    ],
  },
  {
    name: 'Net Masters Cricket Nets',
    sportType: 'cricket',
    area: 'Aliganj',
    address: 'Sitapur Road, Aliganj, Lucknow',
    latitude: 26.8889,
    longitude: 80.9389,
    rating: 4.2,
    openingTime: '06:00',
    closingTime: '21:00',
    description: 'Affordable cricket nets with hourly booking — ideal for weekend practice.',
    courts: [{ name: 'Net A', type: 'net', pricePerHour: 500, maxPlayers: 6 }],
  },
  {
    name: 'Ace Indoor Badminton',
    sportType: 'badminton',
    area: 'Indira Nagar',
    address: 'Sector 14, Indira Nagar, Lucknow',
    latitude: 26.8702,
    longitude: 81.0124,
    rating: 4.0,
    openingTime: '06:00',
    closingTime: '22:00',
    description: 'Indira Nagar neighbourhood courts with parking and changing rooms.',
    courts: [{ name: 'Court 1', type: 'indoor', pricePerHour: 400, maxPlayers: 4 }],
  },
  {
    name: 'Splash Lane Swimming',
    sportType: 'swimming',
    area: 'Indira Nagar',
    address: 'Near 25 Crossing, Indira Nagar, Lucknow',
    latitude: 26.8738,
    longitude: 81.0156,
    rating: 4.3,
    openingTime: '06:00',
    closingTime: '19:00',
    description: '25m pool with lane booking — morning fitness and kids batches.',
    courts: [{ name: 'Main Pool', type: 'pool', pricePerHour: 300, maxPlayers: 8 }],
  },
  {
    name: 'Hazratganj Table Tennis Club',
    sportType: 'table_tennis',
    area: 'Hazratganj',
    address: 'Mahatma Gandhi Marg, Hazratganj, Lucknow 226001',
    latitude: 26.8468,
    longitude: 80.9462,
    rating: 4.4,
    openingTime: '10:00',
    closingTime: '22:00',
    description: 'Central Lucknow TT hall — tournament tables and casual play.',
    courts: [
      { name: 'Table 1', type: 'hall', pricePerHour: 250, maxPlayers: 4 },
      { name: 'Table 2', type: 'hall', pricePerHour: 250, maxPlayers: 4 },
    ],
  },
  {
    name: 'Ganj Futsal Arena',
    sportType: 'football',
    area: 'Hazratganj',
    address: 'Near GPO, Hazratganj, Lucknow',
    latitude: 26.8501,
    longitude: 80.9488,
    rating: 4.2,
    openingTime: '07:00',
    closingTime: '23:00',
    description: 'Compact futsal turf in the heart of Hazratganj — book by the hour.',
    courts: [{ name: 'Futsal Court', type: 'turf', pricePerHour: 1500, maxPlayers: 10 }],
  },
  {
    name: 'SAI Swimming Complex',
    sportType: 'swimming',
    area: 'SAI Lucknow',
    address: 'Sector 9, Gomti Nagar Extension, Lucknow',
    latitude: 26.8711,
    longitude: 81.0203,
    rating: 4.7,
    openingTime: '06:00',
    closingTime: '20:00',
    description: 'Government SAI facility — Olympic-size pool lanes for training and recreation.',
    courts: [{ name: 'Olympic Pool Lane', type: 'pool', pricePerHour: 350, maxPlayers: 8 }],
  },
  {
    name: 'SAI Football Ground',
    sportType: 'football',
    area: 'SAI Lucknow',
    address: 'Sector 9, Gomti Nagar Extension, Lucknow',
    latitude: 26.8725,
    longitude: 81.0188,
    rating: 4.5,
    openingTime: '05:00',
    closingTime: '21:00',
    description: 'Full grass and hybrid training ground used for school and club fixtures.',
    courts: [{ name: 'Main Ground', type: 'grass', pricePerHour: 2000, maxPlayers: 22 }],
  },
  {
    name: 'Lohia Park Morning Turf',
    sportType: 'football',
    area: 'Lohia Park',
    address: 'Lohia Park, Gomti Nagar, Lucknow',
    latitude: 26.8389,
    longitude: 81.0045,
    rating: 4.3,
    openingTime: '05:00',
    closingTime: '22:00',
    description: 'Scenic turf beside Lohia Park — popular for sunrise kickabouts.',
    courts: [{ name: 'Park Turf', type: 'turf', pricePerHour: 1600, maxPlayers: 12 }],
  },
  {
    name: 'Lohia Park Cricket Nets',
    sportType: 'cricket',
    area: 'Lohia Park',
    address: 'Near Gate 2, Lohia Park, Gomti Nagar, Lucknow',
    latitude: 26.8372,
    longitude: 81.0068,
    rating: 4.0,
    openingTime: '06:00',
    closingTime: '20:00',
    description: 'Open-air nets with park views — book before evening rush.',
    courts: [{ name: 'Net 1', type: 'net', pricePerHour: 450, maxPlayers: 6 }],
  },
  {
    name: 'Jankipuram Badminton Arena',
    sportType: 'badminton',
    area: 'Jankipuram',
    address: 'Sector D, Jankipuram, Lucknow',
    latitude: 26.9124,
    longitude: 80.9786,
    rating: 4.1,
    openingTime: '06:00',
    closingTime: '22:00',
    description: 'North Lucknow badminton courts serving Jankipuram and Kursi Road residents.',
    courts: [
      { name: 'Court 1', type: 'indoor', pricePerHour: 380, maxPlayers: 4 },
      { name: 'Court 2', type: 'indoor', pricePerHour: 380, maxPlayers: 4 },
    ],
  },
  {
    name: 'Vikas Nagar Kabaddi Akhara',
    sportType: 'kabaddi',
    area: 'Vikas Nagar',
    address: 'Vikas Nagar, Kalyanpur, Lucknow',
    latitude: 26.9012,
    longitude: 80.9654,
    rating: 4.0,
    openingTime: '05:30',
    closingTime: '21:00',
    description: 'Traditional akhara mat and modern indoor mat for kabaddi practice.',
    courts: [{ name: 'Main Mat', type: 'mat', pricePerHour: 350, maxPlayers: 14 }],
  },
  {
    name: 'Vikas Nagar Multi-Sport Turf',
    sportType: 'football',
    area: 'Vikas Nagar',
    address: 'Hardoi Road, Vikas Nagar, Lucknow',
    latitude: 26.8988,
    longitude: 80.9621,
    rating: 4.2,
    openingTime: '06:00',
    closingTime: '23:00',
    description: 'Multi-use turf for football, cricket box cricket, and fitness bootcamps.',
    courts: [{ name: 'Multi Turf', type: 'turf', pricePerHour: 1700, maxPlayers: 14 }],
  },
];

const SLOT_WINDOWS = [
  { startTime: '06:00', endTime: '07:00' },
  { startTime: '07:00', endTime: '08:00' },
  { startTime: '18:00', endTime: '19:00' },
  { startTime: '19:00', endTime: '20:00' },
  { startTime: '20:00', endTime: '21:00' },
];

function dateOnlyOffset(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return new Date(d.toISOString().slice(0, 10));
}

async function clearOwnerVenues(ownerId) {
  const facilities = await prisma.facility.findMany({
    where: { ownerId },
    include: { courts: { include: { slots: { include: { bookings: { select: { id: true } } } } } } },
  });

  const bookingIds = facilities.flatMap((f) =>
    f.courts.flatMap((c) => c.slots.flatMap((s) => s.bookings.map((b) => b.id)))
  );

  if (bookingIds.length) {
    await prisma.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
    await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } });
  }

  const facilityIds = facilities.map((f) => f.id);
  if (facilityIds.length) {
    await prisma.facility.deleteMany({ where: { id: { in: facilityIds } } });
  }
}

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
      preferredSports: ['badminton', 'football', 'cricket'],
      location: 'Gomti Nagar',
      latitude: 26.85,
      longitude: 81.01,
    },
  });

  await clearOwnerVenues(owner.id);

  const seedDates = [1, 2, 3].map(dateOnlyOffset);
  let colvinFacilityId = null;
  let sampleSlotId = null;

  for (const venue of LUCKNOW_VENUES) {
    const facility = await prisma.facility.create({
      data: {
        name: venue.name,
        description: venue.description,
        sportType: venue.sportType,
        address: venue.address,
        area: venue.area,
        latitude: venue.latitude,
        longitude: venue.longitude,
        ownerId: owner.id,
        rating: venue.rating,
        openingTime: venue.openingTime,
        closingTime: venue.closingTime,
        status: 'ACTIVE',
        courts: {
          create: courtsWithLimits(venue.courts, venue.sportType),
        },
      },
      include: { courts: true },
    });

    if (venue.name === 'Colvin Cricket Academy') {
      colvinFacilityId = facility.id;
    }

    for (const court of facility.courts) {
      const slotRows = seedDates.flatMap((date) =>
        SLOT_WINDOWS.map((w) => ({
          courtId: court.id,
          date,
          startTime: w.startTime,
          endTime: w.endTime,
          availability: 'AVAILABLE',
        }))
      );

      await prisma.slot.createMany({ data: slotRows, skipDuplicates: true });

      if (!sampleSlotId && venue.name === 'Colvin Cricket Academy') {
        const slot = await prisma.slot.findFirst({
          where: { courtId: court.id, date: seedDates[0], startTime: '18:00' },
        });
        sampleSlotId = slot?.id;
      }
    }
  }

  if (colvinFacilityId) {
    await prisma.review.upsert({
      where: {
        facilityId_userId: { facilityId: colvinFacilityId, userId: user.id },
      },
      update: { rating: 5, review: 'Excellent nets and coaching — booked Colvin via PlaySetu.' },
      create: {
        facilityId: colvinFacilityId,
        userId: user.id,
        rating: 5,
        review: 'Excellent nets and coaching — booked Colvin via PlaySetu.',
      },
    });
  }

  if (sampleSlotId) {
    const court = await prisma.court.findFirst({
      where: { slots: { some: { id: sampleSlotId } } },
      include: { slots: { where: { id: sampleSlotId } } },
    });
    const price = court ? Number(court.pricePerHour) : 600;

    await prisma.slot.update({
      where: { id: sampleSlotId },
      data: { availability: 'BOOKED' },
    });

    await prisma.booking.create({
      data: {
        userId: user.id,
        slotId: sampleSlotId,
        playerCount: 4,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        totalAmount: price,
        payment: {
          create: {
            provider: 'MOCK',
            status: 'PAID',
            amount: price,
            transactionId: 'seed-colvin-001',
          },
        },
      },
    });
  }

  console.log('Seed complete:', {
    venues: LUCKNOW_VENUES.length,
    areas: [...new Set(LUCKNOW_VENUES.map((v) => v.area))].sort(),
    admin: admin.email,
    owner: owner.email,
    user: user.email,
    colvin: 'Colvin Cricket Academy',
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
