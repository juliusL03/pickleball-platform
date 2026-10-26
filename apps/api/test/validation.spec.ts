import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginInput, RegisterInput } from '../src/auth/dto/auth.dto';
import {
  CreateBlockedSlotInput,
  CreateBookingHoldInput,
} from '../src/bookings/dto/booking.dto';
import {
  RequestBookingCancellationInput,
  RequestBookingChangeInput,
  ReviewChangeRequestInput,
} from '../src/bookings/dto/change-request.dto';
import { UpsertContentInput } from '../src/content/dto/content.dto';
import { CreateCourtInput, UpdateCourtInput } from '../src/courts/dto/court.dto';
import {
  InitiatePaymentInput,
  PaymentMethod,
  RefundPaymentInput,
  VerifyBankTransferInput,
} from '../src/payments/dto/payment.dto';
import { UpdateVenueInput } from '../src/venue/dto/venue.dto';

const validationOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
};

async function expectValid<T extends object>(
  target: new () => T,
  value: Record<string, unknown>,
) {
  const instance = plainToInstance(target, value);
  const errors = await validate(instance, validationOptions);
  expect(errors).toEqual([]);
}

describe('Input validation', () => {
  it('accepts a registration without phone', async () => {
    await expectValid(RegisterInput, {
      email: 'player@example.com',
      password: 'Passw0rd123',
      firstName: 'Player',
      lastName: 'One',
    });
  });

  it('accepts a registration with phone', async () => {
    await expectValid(RegisterInput, {
      email: 'player@example.com',
      password: 'Passw0rd123',
      firstName: 'Player',
      lastName: 'One',
      phone: '+639171234567',
    });
  });

  it('rejects unknown fields on registration', async () => {
    const instance = plainToInstance(RegisterInput, {
      email: 'player@example.com',
      password: 'Passw0rd123',
      firstName: 'Player',
      lastName: 'One',
      confirmPassword: 'Passw0rd123',
    });
    const errors = await validate(instance, validationOptions);
    expect(errors.some((error) => error.property === 'confirmPassword')).toBe(
      true,
    );
  });

  it('validates all other input types', async () => {
    await expectValid(LoginInput, {
      email: 'player@example.com',
      password: 'Passw0rd123',
    });

    await expectValid(CreateBookingHoldInput, {
      courtId: '507f1f77bcf86cd799439011',
      startTime: '2026-11-01T09:00:00.000Z',
      duration: 60,
    });

    await expectValid(RequestBookingChangeInput, {
      bookingId: '507f1f77bcf86cd799439011',
      reason: 'Schedule conflict',
    });

    await expectValid(RequestBookingCancellationInput, {
      bookingId: '507f1f77bcf86cd799439011',
      reason: 'Schedule conflict',
    });

    await expectValid(ReviewChangeRequestInput, {
      approve: true,
    });

    await expectValid(CreateBlockedSlotInput, {
      startTime: '2026-11-01T09:00:00.000Z',
      endTime: '2026-11-01T10:00:00.000Z',
      reason: 'Maintenance',
      type: 'maintenance',
    });

    await expectValid(CreateCourtInput, {
      venueId: '507f1f77bcf86cd799439011',
      name: 'Centre Court',
      slug: 'centre-court',
      amenities: ['Floodlights'],
    });

    await expectValid(UpdateCourtInput, {
      name: 'Centre Court',
      isActive: true,
      sortOrder: 1,
    });

    await expectValid(UpdateVenueInput, {
      name: 'Pickleball Club',
      description: 'Indoor courts',
    });

    await expectValid(UpsertContentInput, {
      key: 'home',
      type: 'page',
      content: { heading: 'Welcome' },
      isPublished: true,
    });

    await expectValid(InitiatePaymentInput, {
      bookingId: '507f1f77bcf86cd799439011',
      method: PaymentMethod.QRPH,
    });

    await expectValid(VerifyBankTransferInput, {
      paymentId: '507f1f77bcf86cd799439012',
      approved: true,
    });

    await expectValid(RefundPaymentInput, {
      paymentId: '507f1f77bcf86cd799439012',
      reason: 'Cancelled booking',
    });
  });
});
