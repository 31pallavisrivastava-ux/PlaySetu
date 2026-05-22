export const POPULAR_SPORTS = [
  {
    id: 'badminton',
    label: 'Badminton',
    tagline: 'Courts & games',
    emoji: '🏸',
    gradient: 'from-emerald-400 to-teal-600',
  },
  {
    id: 'football',
    label: 'Football',
    tagline: 'Turfs & fives',
    emoji: '⚽',
    gradient: 'from-green-500 to-emerald-700',
  },
  {
    id: 'cricket',
    label: 'Cricket',
    tagline: 'Nets & grounds',
    emoji: '🏏',
    gradient: 'from-lime-500 to-green-700',
  },
  {
    id: 'swimming',
    label: 'Swimming',
    tagline: 'Pools & lanes',
    emoji: '🏊',
    gradient: 'from-cyan-400 to-blue-600',
  },
  {
    id: 'table_tennis',
    label: 'Table Tennis',
    tagline: 'Halls & clubs',
    emoji: '🏓',
    gradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'kabaddi',
    label: 'Kabaddi',
    tagline: 'Akharas',
    emoji: '🤼',
    gradient: 'from-orange-400 to-red-500',
  },
];

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

export function formatSport(sportType) {
  if (!sportType) return 'Sports';
  return sportType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
