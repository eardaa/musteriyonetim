import { addMonths } from "@/lib/format";

export const UPCOMING_DAYS = 30;

export type ReminderStatus = "overdue" | "upcoming" | "ok";

export function nextChangeDate(
  sonDegisimTarihi: Date | null,
  degisimPeriyoduAy: number,
  installDate: Date
): Date {
  const base = sonDegisimTarihi ?? installDate;
  return addMonths(base, degisimPeriyoduAy);
}

export function reminderStatus(
  nextDate: Date,
  now: Date = new Date(),
  upcomingDays = UPCOMING_DAYS
): ReminderStatus {
  const diffMs = nextDate.getTime() - now.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);
  if (days < 0) return "overdue";
  if (days <= upcomingDays) return "upcoming";
  return "ok";
}

export function daysUntil(date: Date, now: Date = new Date()): number {
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
