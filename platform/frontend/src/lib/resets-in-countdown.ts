import { useEffect, useState } from "react";

export type CleanupInterval = "1h" | "12h" | "24h" | "1w" | "1m";

const INTERVAL_MS: Record<CleanupInterval, number> = {
  "1h": 60 * 60 * 1000,
  "12h": 12 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "1w": 7 * 24 * 60 * 60 * 1000,
  "1m": 30 * 24 * 60 * 60 * 1000,
};

/**
 * Calculate when a limit will next reset based on lastCleanup (or createdAt)
 * and the cleanup interval.
 */
export function getNextResetTime(
  lastCleanup: Date | null | undefined,
  createdAt: Date | string,
  cleanupInterval: CleanupInterval,
): Date {
  const intervalMs = INTERVAL_MS[cleanupInterval];
  const referenceDate = lastCleanup
    ? new Date(lastCleanup)
    : new Date(createdAt);

  const now = Date.now();
  const refMs = referenceDate.getTime();

  // Calculate how many intervals have passed since the reference date
  const elapsed = now - refMs;
  const intervalsPassed = Math.floor(elapsed / intervalMs);

  // Next reset is at the start of the next interval
  return new Date(refMs + (intervalsPassed + 1) * intervalMs);
}

/**
 * Format a duration in milliseconds to a human-readable string
 */
function formatDuration(ms: number): string {
  if (ms <= 0) return "now";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/**
 * Hook that returns a live countdown string for when a limit resets.
 * Updates every minute.
 */
export function useResetsInCountdown(
  lastCleanup: Date | null | undefined,
  createdAt: Date | string,
  cleanupInterval: CleanupInterval,
): string {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const nextReset = getNextResetTime(lastCleanup, createdAt, cleanupInterval);
  const remaining = nextReset.getTime() - now;

  if (remaining <= 0) return "resetting soon";
  return `resets in ${formatDuration(remaining)}`;
}
