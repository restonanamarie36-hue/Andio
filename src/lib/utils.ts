import { BPM_MIN, BPM_MAX, VELOCITY_MIN, VELOCITY_MAX, PERCENT_MIN, PERCENT_MAX } from './constants';

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp BPM to valid range (40-240)
 */
export function clampBpm(bpm: number): number {
  return clamp(bpm, BPM_MIN, BPM_MAX);
}

/**
 * Clamp velocity to valid range (0-1)
 */
export function clampVelocity(velocity: number): number {
  return clamp(velocity, VELOCITY_MIN, VELOCITY_MAX);
}

/**
 * Clamp percentage value (0-100)
 */
export function clampPercent(value: number): number {
  return clamp(value, PERCENT_MIN, PERCENT_MAX);
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format duration as M:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a sanitized filename from project name
 */
export function sanitizeFilename(name: string): string {
  const sanitized = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return sanitized || 'untitled';
}

/**
 * Convert dB value to linear (0-100%)
 */
export function dbToLinear(db: number): number {
  if (db <= -60) return 0;
  return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
}

/**
 * Convert linear (0-100%) to dB
 */
export function linearToDb(linear: number): number {
  if (linear === 0) return -Infinity;
  return (linear / 100) * 40 - 40;
}
