export const SPORT_PLAYER_LIMITS = {
  badminton: { min: 2, max: 4, hint: '2–4 players (singles or doubles)' },
  football: { min: 8, max: 22, hint: '8–22 players depending on turf size' },
  cricket: { min: 2, max: 8, hint: '2–8 players per net session' },
  swimming: { min: 1, max: 8, hint: '1–8 swimmers per lane booking' },
  table_tennis: { min: 2, max: 4, hint: '2–4 players' },
  kabaddi: { min: 7, max: 14, hint: '7–14 players per mat' },
  indoor_arena: { min: 2, max: 10, hint: '2–10 players' },
  government_complex: { min: 2, max: 20, hint: '2–20 players' },
};

export function getCourtPlayerCapacity(court, sportType) {
  const sport = SPORT_PLAYER_LIMITS[sportType] ?? { min: 1, max: 10, hint: '1–10 players' };
  const minPlayers = Math.max(sport.min, court.minPlayers ?? sport.min);
  const maxPlayers = Math.min(sport.max, court.maxPlayers ?? sport.max);
  return {
    minPlayers,
    maxPlayers: Math.max(minPlayers, maxPlayers),
    hint: sport.hint,
  };
}

export function playerCountOptions(court, sportType) {
  const { minPlayers, maxPlayers } = getCourtPlayerCapacity(court, sportType);
  const options = [];
  for (let n = minPlayers; n <= maxPlayers; n += 1) options.push(n);
  return options;
}
