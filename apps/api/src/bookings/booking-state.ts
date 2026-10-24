import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from './schemas/booking.schema';

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  'hold',
  'pending_payment',
  'confirmed',
];

export const TERMINAL_BOOKING_STATUSES: BookingStatus[] = [
  'cancelled',
  'completed',
  'no_show',
];

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  hold: ['pending_payment', 'confirmed', 'cancelled'],
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new BadRequestException(
      `Invalid booking state transition: ${from} -> ${to}`,
    );
  }
}
