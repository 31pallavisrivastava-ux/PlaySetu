let cached = null;

export function getUserLocation({ timeout = 5000, maxAgeMs = 60_000 } = {}) {
  if (cached && Date.now() - cached.at < maxAgeMs) {
    return Promise.resolve(cached.coords);
  }

  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const done = (coords) => {
      cached = coords ? { coords, at: Date.now() } : null;
      resolve(coords);
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => done({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => done(null),
      { timeout, maximumAge: maxAgeMs }
    );
  });
}

export function clearCachedLocation() {
  cached = null;
}
