import type {Booking} from '../types';

export function getEndHour(startHour: number, hours: number): number {
  return startHour + hours;
}

export function computeTotalPrice(pricePerHour: number, hours: number): number {
  if (!Number.isFinite(hours) || hours <= 0) {
    return 0;
  }
  return Math.round(pricePerHour * hours);
}

export function hasTimeOverlap(
  candidateStart: number,
  candidateHours: number,
  existingStart: number,
  existingHours: number,
): boolean {
  const candidateEnd = candidateStart + candidateHours;
  const existingEnd = existingStart + existingHours;
  return candidateStart < existingEnd && existingStart < candidateEnd;
}

export function isBookingConflict(
  candidate: Pick<Booking, 'fieldId' | 'date' | 'startHour' | 'hours'>,
  existingBookings: Booking[],
  ignoreBookingId?: string,
): boolean {
  return existingBookings.some(booking => {
    if (ignoreBookingId && booking.id === ignoreBookingId) {
      return false;
    }
    if (booking.fieldId !== candidate.fieldId || booking.date !== candidate.date) {
      return false;
    }
    return hasTimeOverlap(
      candidate.startHour,
      candidate.hours,
      booking.startHour,
      booking.hours,
    );
  });
}
