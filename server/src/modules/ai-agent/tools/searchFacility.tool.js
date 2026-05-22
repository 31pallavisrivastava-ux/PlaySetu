import * as facilityService from '../../facilities/service.js';

export const searchFacilityTool = {
  type: 'function',
  function: {
    name: 'search_facility',
    description: 'Search sports facilities in Lucknow by sport, area, budget, and geo',
    parameters: {
      type: 'object',
      properties: {
        sportType: { type: 'string', description: 'e.g. badminton, football' },
        area: { type: 'string', description: 'Lucknow locality' },
        maxPrice: { type: 'number', description: 'Max price per hour in INR' },
        lat: { type: 'number' },
        lng: { type: 'number' },
        limit: { type: 'number', default: 5 },
      },
    },
  },
};

export async function runSearchFacility(args) {
  const result = await facilityService.searchFacilities({
    sportType: args.sportType,
    area: args.area,
    maxPrice: args.maxPrice,
    lat: args.lat,
    lng: args.lng,
    page: 1,
    limit: args.limit ?? 5,
    radiusKm: 15,
  });
  return result.items.map((f) => ({
    id: f.id,
    name: f.name,
    sportType: f.sportType,
    area: f.area,
    address: f.address,
    rating: f.rating,
    distanceKm: f.distanceKm,
    courts: f.courts?.map((c) => ({
      id: c.id,
      name: c.name,
      pricePerHour: Number(c.pricePerHour),
      maxPlayers: c.maxPlayers,
    })),
  }));
}
