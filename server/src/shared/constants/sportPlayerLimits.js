/** Default min/max players per activity (court limits may narrow further). */
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

const DEFAULT_LIMITS = { min: 1, max: 10, hint: '1–10 players' };

export function getSportPlayerLimits(sportType) {
  return SPORT_PLAYER_LIMITS[sportType] ?? DEFAULT_LIMITS;
}

/** Effective capacity for a court = sport rules ∩ court min/max. */
export function getCourtPlayerCapacity(court, sportType) {
  const sport = getSportPlayerLimits(sportType);
  const courtMin = court.minPlayers ?? sport.min;
  const courtMax = court.maxPlayers ?? sport.max;
  const minPlayers = Math.max(sport.min, courtMin);
  const maxPlayers = Math.min(sport.max, courtMax);
  return {
    minPlayers,
    maxPlayers: Math.max(minPlayers, maxPlayers),
    hint: sport.hint,
  };
}

export function validatePlayerCount(playerCount, court, sportType) {
  const { minPlayers, maxPlayers, hint } = getCourtPlayerCapacity(court, sportType);
  if (!Number.isInteger(playerCount) || playerCount < minPlayers || playerCount > maxPlayers) {
    return {
      ok: false,
      message: `This activity allows ${minPlayers}–${maxPlayers} players per booking (${hint}).`,
      minPlayers,
      maxPlayers,
    };
  }
  return { ok: true, minPlayers, maxPlayers, hint };
}
