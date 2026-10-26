import { BadRequestException } from '@nestjs/common';
import { assertTransition, canTransition } from '../src/bookings/booking-state';

describe('booking state machine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('hold', 'confirmed')).toBe(true);
    expect(canTransition('pending_payment', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'completed')).toBe(true);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
    expect(() => assertTransition('completed', 'confirmed')).toThrow(
      BadRequestException,
    );
  });
});
