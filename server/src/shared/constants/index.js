export const LUCKNOW_AREAS = [
  'Gomti Nagar',
  'Chinhat',
  'Aliganj',
  'Indira Nagar',
  'Hazratganj',
  'SAI Lucknow',
  'Lohia Park',
  'Jankipuram',
  'Vikas Nagar',
];

export const SPORT_TYPES = [
  'badminton',
  'football',
  'cricket',
  'swimming',
  'table_tennis',
  'kabaddi',
  'indoor_arena',
  'government_complex',
];

export const CACHE_KEYS = {
  facilitiesSearch: (hash) => `cache:facilities:${hash}`,
  trendingAreas: 'cache:trending:areas',
};

export const CACHE_TTL = 300;
