/**
 * useNearMeState — shared "Near Me" hook for Autism Pathways
 *
 * Requests foreground location permission once, gets the device's current
 * position, and reverse-geocodes it to a US state abbreviation (e.g. "CO").
 *
 * Usage:
 *   const { detectState, isDetecting, locationError } = useNearMeState();
 *   // Call detectState() when user taps the "📍 Near Me" button.
 *   // It resolves with the 2-letter state code or null on failure.
 *
 * The hook never throws — all errors are surfaced via locationError.
 */
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

// Map of full state names → 2-letter abbreviations
const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM',
  'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA',
  'rhode island': 'RI', 'south carolina': 'SC', 'south dakota': 'SD',
  tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
};

export type NearMeResult = {
  /** 2-letter state code, e.g. "CO" */
  stateCode: string;
  /** Full state name, e.g. "Colorado" */
  stateName: string;
  /** City name if available */
  city?: string;
} | null;

export function useNearMeState() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const detectState = useCallback(async (): Promise<NearMeResult> => {
    setIsDetecting(true);
    setLocationError(null);

    try {
      // 1. Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please select your state manually.');
        setIsDetecting(false);
        return null;
      }

      // 2. Get current position (low accuracy is fine — we only need state)
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      // 3. Reverse geocode
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (!geo) {
        setLocationError('Could not determine your location. Please select your state manually.');
        setIsDetecting(false);
        return null;
      }

      // geo.region may be a full state name ("Colorado") or a 2-letter code ("CO")
      // depending on OS version. Also try administrativeArea as a fallback.
      const CODE_VALUES = Object.values(STATE_NAME_TO_CODE);
      const tryResolveCode = (raw: string | null | undefined): string | null => {
        if (!raw) return null;
        const trimmed = raw.trim();
        // Already a valid 2-letter code?
        if (CODE_VALUES.includes(trimmed.toUpperCase())) return trimmed.toUpperCase();
        // Full name lookup (case-insensitive)
        return STATE_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
      };
      const stateCode =
        tryResolveCode(geo.region) ??
        tryResolveCode(geo.administrativeArea) ??
        null;

      if (!stateCode) {
        setLocationError('Could not detect your state. Please select it manually.');
        setIsDetecting(false);
        return null;
      }

      // Capitalize the state name properly
      const stateName = Object.keys(STATE_NAME_TO_CODE).find(
        (k) => STATE_NAME_TO_CODE[k] === stateCode
      ) ?? (geo.region ?? geo.administrativeArea ?? stateCode);
      const formattedName = stateName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      setIsDetecting(false);
      return {
        stateCode,
        stateName: formattedName,
        city: geo.city ?? undefined,
      };
    } catch (err: any) {
      const msg = err?.message ?? 'Location unavailable. Please select your state manually.';
      setLocationError(msg);
      setIsDetecting(false);
      return null;
    }
  }, []);

  return { detectState, isDetecting, locationError };
}
