import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

export const bookingHoldSchema = z.object({
  courtId: z.string().min(1, 'Court is required'),
  startTime: z.string().datetime(),
  duration: z.number().min(30).max(240),
});

export const changeRequestSchema = z.object({
  bookingId: z.string().min(1),
  newStartTime: z.string().datetime().optional(),
  newDuration: z.number().min(30).max(240).optional(),
  newCourtId: z.string().optional(),
  reason: z.string().min(5, 'Please provide a reason').max(1000),
});

export const cancellationRequestSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(5, 'Please provide a reason').max(1000),
});

export const blockedSlotSchema = z
  .object({
    courtId: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    reason: z.string().min(1),
    type: z.enum(['holiday', 'maintenance', 'private_event', 'other']),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingHoldInput = z.infer<typeof bookingHoldSchema>;
export type ChangeRequestInput = z.infer<typeof changeRequestSchema>;
export type CancellationRequestInput = z.infer<typeof cancellationRequestSchema>;
export type BlockedSlotInput = z.infer<typeof blockedSlotSchema>;

export const initiatePaymentSchema = z.object({
  bookingId: z.string().min(1),
  method: z.enum(['gcash', 'maya', 'qrph', 'gateway', 'bank_transfer']),
  proofImageUrl: z.string().url().optional(),
  referenceNumber: z.string().optional(),
});

export const verifyBankTransferSchema = z.object({
  paymentId: z.string().min(1),
  approved: z.boolean(),
  notes: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().int().nonnegative().optional(),
  reason: z.string().min(1),
});
