export function homePathForRole(role) {
  if (role === 'OWNER' || role === 'ADMIN') return '/owner';
  return '/facilities';
}
