// Thin, promise-based wrapper over the browser Geolocation API.
// Nothing here runs until the customer clicks "Use current location" (never in the background).

export const GEO_ERRORS = {
  UNSUPPORTED: { retry: false, title: 'Location is not supported', message: 'This browser can’t detect your location. Please enter your address manually.' },
  INSECURE: { retry: false, title: 'Secure connection needed', message: 'Browsers only allow location access on secure (https://) pages or on localhost. Please open FreshNest over HTTPS, or enter your address manually.' },
  DENIED: { retry: true, title: 'Location permission blocked', message: 'FreshNest doesn’t have permission to use your location. Allow location access for this site in your browser’s site settings (the icon next to the address bar), then try again, or enter your address manually.' },
  UNAVAILABLE: { retry: true, title: 'Couldn’t find your location', message: 'Your device couldn’t work out where you are. Check that location services / GPS are switched on, then try again, or enter your address manually.' },
  TIMEOUT: { retry: true, title: 'Location is taking too long', message: 'Detecting your location timed out. Try again (a window seat or an open area helps), or enter your address manually.' },
  UNKNOWN: { retry: true, title: 'Something went wrong', message: 'We couldn’t detect your location. Please try again or enter your address manually.' },
};

const failure = code => Object.assign(new Error(GEO_ERRORS[code].message), { code });

/** Resolves { lat, lon, accuracy } (accuracy in metres) or rejects with an Error that has a `.code` from GEO_ERRORS. */
export function getCurrentPosition({ timeout = 15000, highAccuracy = true } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(failure('UNSUPPORTED'));
    if (typeof window !== 'undefined' && window.isSecureContext === false) return reject(failure('INSECURE'));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy || 0) }),
      err => reject(failure(err?.code === 1 ? 'DENIED' : err?.code === 2 ? 'UNAVAILABLE' : err?.code === 3 ? 'TIMEOUT' : 'UNKNOWN')),
      { enableHighAccuracy: highAccuracy, timeout, maximumAge: 0 },
    );
  });
}
