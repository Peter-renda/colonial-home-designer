/**
 * Lightweight solar-position math for the site analysis sun-path animation.
 *
 * Everything is derived from latitude and the day of the year — no network
 * call required. Longitude only shifts the clock, not the geometry of the
 * arc, so the diagram works from latitude alone.
 */

const DEG = Math.PI / 180;

export interface SunSample {
  /** Solar time, hours (0–24, 12 = solar noon). */
  hour: number;
  /** Altitude above the horizon, degrees (negative = below horizon). */
  altitude: number;
  /** Azimuth from true north, degrees clockwise (90 = due east). */
  azimuth: number;
}

export interface SunPath {
  latitude: number;
  dayOfYear: number;
  /** Samples across the full day at 10-minute resolution. */
  samples: SunSample[];
  /** Daylight samples only (altitude ≥ 0). */
  daylight: SunSample[];
  sunriseHour: number | null;
  sunsetHour: number | null;
  /** Sun altitude at solar noon, degrees. */
  noonAltitude: number;
  /** Length of day, hours. */
  daylightHours: number;
}

/** Solar declination for a given day of the year (Cooper's approximation). */
export function solarDeclination(dayOfYear: number): number {
  return 23.45 * Math.sin(DEG * (360 / 365) * (dayOfYear - 81));
}

export function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000);
}

/** Common reference days. */
export const REFERENCE_DAYS = {
  summerSolstice: 172, // ~Jun 21
  equinox: 80, // ~Mar 21
  winterSolstice: 355, // ~Dec 21
};

/**
 * Compute the sun's altitude/azimuth across a day at the given latitude.
 */
export function computeSunPath(latitude: number, day: number): SunPath {
  const decl = solarDeclination(day);
  const latRad = latitude * DEG;
  const declRad = decl * DEG;

  const samples: SunSample[] = [];
  for (let m = 0; m <= 24 * 60; m += 10) {
    const hour = m / 60;
    const hourAngle = (hour - 12) * 15; // degrees, 15°/hr
    const haRad = hourAngle * DEG;

    const sinAlt =
      Math.sin(latRad) * Math.sin(declRad) +
      Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAlt))) / DEG;

    // Azimuth measured clockwise from north.
    const cosAz =
      (Math.sin(declRad) - Math.sin(altitude * DEG) * Math.sin(latRad)) /
      (Math.cos(altitude * DEG) * Math.cos(latRad) || 1e-6);
    let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) / DEG;
    if (hourAngle > 0) azimuth = 360 - azimuth; // afternoon → west of north

    samples.push({ hour, altitude, azimuth });
  }

  const daylight = samples.filter((s) => s.altitude >= 0);

  // Sunrise/sunset via the hour-angle of the horizon.
  const cosH = -Math.tan(latRad) * Math.tan(declRad);
  let sunriseHour: number | null = null;
  let sunsetHour: number | null = null;
  if (cosH < -1) {
    // sun never sets (polar day)
    sunriseHour = 0;
    sunsetHour = 24;
  } else if (cosH > 1) {
    // sun never rises (polar night)
    sunriseHour = null;
    sunsetHour = null;
  } else {
    const H = Math.acos(cosH) / DEG; // degrees
    sunriseHour = 12 - H / 15;
    sunsetHour = 12 + H / 15;
  }

  const noonAltitude = 90 - Math.abs(latitude - decl);
  const daylightHours = sunriseHour != null && sunsetHour != null ? sunsetHour - sunriseHour : 0;

  return {
    latitude,
    dayOfYear: day,
    samples,
    daylight,
    sunriseHour,
    sunsetHour,
    noonAltitude,
    daylightHours,
  };
}

function fmtTime(hour: number | null): string {
  if (hour == null) return "—";
  const h24 = Math.max(0, Math.min(24, hour));
  let h = Math.floor(h24);
  const min = Math.round((h24 - h) * 60);
  let mm = min;
  if (mm === 60) {
    h += 1;
    mm = 0;
  }
  const period = h >= 12 ? "pm" : "am";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${mm.toString().padStart(2, "0")} ${period}`;
}

export function formatTime(hour: number | null): string {
  return fmtTime(hour);
}

/** A compass label (N/E/S/W and between) for an azimuth in degrees. */
export function azimuthCompass(azimuth: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const idx = Math.round(((azimuth % 360) / 45)) % 8;
  return dirs[idx];
}
