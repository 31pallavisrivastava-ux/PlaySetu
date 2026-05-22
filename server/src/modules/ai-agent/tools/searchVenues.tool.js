import * as facilityService from '../../facilities/service.js';

export const searchVenuesTool = {
  type: 'function',
  function: {
    name: 'search_venues',
    description:
      'Find sports facilities by sport, area, budget, and skill suitability. Uses the user\'s current location when available to compute distance and apply a radius filter.',
    parameters: {
      type: 'object',
      properties: {
        sport: { type: 'string', description: 'e.g. badminton, football, cricket' },
        area: { type: 'string', description: 'Locality name (e.g. Gomti Nagar)' },
        maxBudget: { type: 'number', description: 'Max price per hour in INR' },
        skill: {
          type: 'string',
          enum: ['Beginner', 'Intermediate', 'Advanced'],
          description: 'Player skill level (advisory)',
        },
        radiusKm: { type: 'number', description: 'Search radius in km from user location' },
      },
    },
  },
};

export async function runSearchVenues(args, ctx = {}) {
  const result = await facilityService.searchFacilities({
    sportType: args.sport,
    area: args.area,
    maxPrice: args.maxBudget,
    skill: args.skill,
    lat: ctx.lat,
    lng: ctx.lng,
    page: 1,
    limit: args.limit ?? 5,
    radiusKm: args.radiusKm ?? 15,
  });

  return result.items.map((f) => ({
    venueId: f.id,
    name: f.name,
    sportType: f.sportType,
    area: f.area,
    address: f.address,
    lat: f.latitude,
    lng: f.longitude,
    googleMapsUrl: buildGoogleMapsUrl(f),
    rating: f.rating,
    distanceKm: f.distanceKm,
    skill: args.skill ?? null,
    courts: f.courts?.map((c) => ({
      courtId: c.id,
      name: c.name,
      pricePerHour: Number(c.pricePerHour),
      maxPlayers: c.maxPlayers,
    })),
  }));
}

function buildGoogleMapsUrl(f) {
  if (f.latitude != null && f.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${f.latitude},${f.longitude}`;
  }
  const q = encodeURIComponent([f.name, f.address].filter(Boolean).join(', '));
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
