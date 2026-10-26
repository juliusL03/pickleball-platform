import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsISO8601,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@ObjectType()
export class BookingPricingType {
  @Field(() => Float)
  basePrice!: number;

  @Field(() => Float)
  fees!: number;

  @Field(() => Float)
  discount!: number;

  @Field(() => Float)
  total!: number;

  @Field()
  currency!: string;
}

@ObjectType()
export class BookingType {
  @Field(() => ID)
  id!: string;

  @Field()
  bookingNumber!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  courtId!: string;

  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  status!: string;

  @Field(() => BookingPricingType)
  pricing!: BookingPricingType;

  @Field({ nullable: true })
  holdExpiresAt?: string;

  @Field({ nullable: true })
  cancellationReason?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  createdAt?: string;
}

@ObjectType()
export class TimeSlotType {
  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field()
  available!: boolean;

  @Field(() => Float)
  price!: number;
}

@ObjectType()
export class BookingQuoteType {
  @Field()
  available!: boolean;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field(() => Int)
  duration!: number;

  @Field(() => Float, { nullable: true })
  basePrice?: number;

  @Field(() => Float, { nullable: true })
  fees?: number;

  @Field(() => Float, { nullable: true })
  discount?: number;

  @Field(() => Float, { nullable: true })
  total?: number;

  @Field({ nullable: true })
  currency?: string;
}

@InputType()
export class CreateBookingHoldInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  courtId!: string;

  @Field()
  @IsISO8601()
  startTime!: string;

  @Field(() => Int)
  @IsInt()
  @Min(15)
  @Max(600)
  duration!: number;
}

@InputType()
export class CreateBlockedSlotInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  courtId?: string;

  @Field()
  @IsISO8601()
  startTime!: string;

  @Field()
  @IsISO8601()
  endTime!: string;

  @Field()
  @IsString()
  @MinLength(1)
  reason!: string;

  @Field()
  @IsString()
  @IsIn(['holiday', 'maintenance', 'private_event', 'other'])
  type!: string;
}

@ObjectType()
export class BlockedSlotType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  courtId?: string;

  @Field()
  startTime!: string;

  @Field()
  endTime!: string;

  @Field()
  reason!: string;

  @Field()
  type!: string;
}

export function mapBooking(booking: any): BookingType {
  return {
    id: booking._id.toString(),
    bookingNumber: booking.bookingNumber,
    userId: booking.userId.toString(),
    courtId: booking.courtId.toString(),
    startTime: new Date(booking.startTime).toISOString(),
    endTime: new Date(booking.endTime).toISOString(),
    duration: booking.duration,
    status: booking.status,
    pricing: {
      basePrice: booking.pricing.basePrice,
      fees: booking.pricing.fees,
      discount: booking.pricing.discount,
      total: booking.pricing.total,
      currency: booking.pricing.currency,
    },
    holdExpiresAt: booking.holdExpiresAt
      ? new Date(booking.holdExpiresAt).toISOString()
      : undefined,
    cancellationReason: booking.cancellationReason,
    notes: booking.notes,
    createdAt: booking.createdAt
      ? new Date(booking.createdAt).toISOString()
      : undefined,
  };
}

export function mapBlockedSlot(block: any): BlockedSlotType {
  return {
    id: block._id.toString(),
    courtId: block.courtId ? block.courtId.toString() : undefined,
    startTime: new Date(block.startTime).toISOString(),
    endTime: new Date(block.endTime).toISOString(),
    reason: block.reason,
    type: block.type,
  };
}
