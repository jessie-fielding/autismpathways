import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Situation, Location, Intensity } from './parentingStrategies';

// ─── Storage key helpers ──────────────────────────────────────────────────────
// Parenting Pathways logs are child-scoped when a childId is present,
// matching the same pattern used throughout the rest of the app.

export const PP_LOG_BASE_KEY = 'ap_parenting_pathways_log';

/** Returns the AsyncStorage key for a given child (or the global key if no childId). */
export function ppLogKey(childId?: string | null): string {
  return childId ? `${PP_LOG_BASE_KEY}_${childId}` : PP_LOG_BASE_KEY;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PPLogEntry {
  id: string;
  timestamp: number; // UTC ms
  situation: Situation;
  location: Location;
  intensity: Intensity;
  primaryStrategyId: string;
  feedback: 'helped' | 'try_another' | null;
  childId?: string;
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export async function ppGetLog(childId?: string | null): Promise<PPLogEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ppLogKey(childId));
    if (!raw) return [];
    return JSON.parse(raw) as PPLogEntry[];
  } catch {
    return [];
  }
}

export async function ppAddEntry(
  entry: Omit<PPLogEntry, 'id'>,
): Promise<PPLogEntry> {
  const id = `pp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const full: PPLogEntry = { ...entry, id };
  const existing = await ppGetLog(entry.childId);
  const updated = [full, ...existing];
  await AsyncStorage.setItem(ppLogKey(entry.childId), JSON.stringify(updated));
  return full;
}

export async function ppUpdateFeedback(
  id: string,
  feedback: 'helped' | 'try_another',
  childId?: string | null,
): Promise<void> {
  const log = await ppGetLog(childId);
  const updated = log.map((e) => (e.id === id ? { ...e, feedback } : e));
  await AsyncStorage.setItem(ppLogKey(childId), JSON.stringify(updated));
}

// ─── Trend helpers ────────────────────────────────────────────────────────────

export interface TrendData {
  triggerCounts: Record<Situation, number>;
  locationCounts: Record<Location, number>;
  intensityCounts: Record<Intensity, number>;
  hourCounts: number[]; // index 0-23
  dayOfWeekCounts: number[]; // index 0-6 (Sun-Sat)
  strategyEffectiveness: { strategyId: string; helped: number; total: number }[];
  totalEntries: number;
}

export function computeTrends(log: PPLogEntry[]): TrendData {
  const triggerCounts = {} as Record<Situation, number>;
  const locationCounts = {} as Record<Location, number>;
  const intensityCounts = {} as Record<Intensity, number>;
  const hourCounts = Array(24).fill(0);
  const dayOfWeekCounts = Array(7).fill(0);
  const strategyMap: Record<string, { helped: number; total: number }> = {};

  for (const entry of log) {
    triggerCounts[entry.situation] = (triggerCounts[entry.situation] ?? 0) + 1;
    locationCounts[entry.location] = (locationCounts[entry.location] ?? 0) + 1;
    intensityCounts[entry.intensity] = (intensityCounts[entry.intensity] ?? 0) + 1;

    const d = new Date(entry.timestamp);
    hourCounts[d.getHours()]++;
    dayOfWeekCounts[d.getDay()]++;

    if (entry.primaryStrategyId) {
      if (!strategyMap[entry.primaryStrategyId]) {
        strategyMap[entry.primaryStrategyId] = { helped: 0, total: 0 };
      }
      strategyMap[entry.primaryStrategyId].total++;
      if (entry.feedback === 'helped') {
        strategyMap[entry.primaryStrategyId].helped++;
      }
    }
  }

  const strategyEffectiveness = Object.entries(strategyMap)
    .map(([strategyId, v]) => ({ strategyId, ...v }))
    .sort(
      (a, b) =>
        b.helped / Math.max(b.total, 1) - a.helped / Math.max(a.total, 1),
    );

  return {
    triggerCounts,
    locationCounts,
    intensityCounts,
    hourCounts,
    dayOfWeekCounts,
    strategyEffectiveness,
    totalEntries: log.length,
  };
}
