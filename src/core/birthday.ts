/**
 * Birthday-week logic (pure — no DOM, no side effects).
 */
import { BIRTHDAY_DAY, BIRTHDAY_MONTH } from "../configs/profile";

/**
 * Whether the ISO 8601 week (Monday–Sunday) containing `date` also
 * contains the author's birthday (Sep 8).
 *
 * @param date - Date to test; defaults to now (visitor local timezone).
 * @returns `true` when the birthday falls inside `date`'s week.
 */
export function isBirthdayWeek(date: Date = new Date()): boolean {
  const birthday = new Date(
    date.getFullYear(),
    BIRTHDAY_MONTH - 1,
    BIRTHDAY_DAY,
  );

  // Monday of the given date's week (ISO 8601).
  const weekStart = new Date(date);
  const mondayOffset = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  // Sunday (end of the same week).
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return birthday >= weekStart && birthday <= weekEnd;
}
