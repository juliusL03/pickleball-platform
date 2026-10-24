import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingStatus =
  | 'hold'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type BookingDocument = Booking & Document;

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true })
  bookingNumber!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Court', required: true })
  courtId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId!: Types.ObjectId;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ required: true })
  duration!: number;

  @Prop({
    type: String,
    enum: ['hold', 'pending_payment', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'hold',
  })
  status!: BookingStatus;

  @Prop({
    type: Object,
    required: true,
  })
  pricing!: {
    basePrice: number;
    fees: number;
    discount: number;
    total: number;
    currency: string;
  };

  @Prop()
  holdExpiresAt?: Date;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy?: Types.ObjectId;

  @Prop()
  notes?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ bookingNumber: 1 }, { unique: true });
BookingSchema.index({ courtId: 1, startTime: 1, endTime: 1, status: 1 });
BookingSchema.index({ courtId: 1, status: 1, startTime: 1 });
BookingSchema.index({ userId: 1, status: 1, startTime: -1 });
BookingSchema.index({ holdExpiresAt: 1, status: 1 });
BookingSchema.index({ startTime: 1, status: 1 });
