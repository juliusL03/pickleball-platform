import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingSlotDocument = BookingSlot & Document;

@Schema({ timestamps: false })
export class BookingSlot {
  @Prop({ type: Types.ObjectId, ref: 'Court', required: true })
  courtId!: Types.ObjectId;

  @Prop({ required: true })
  startAt!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId!: Types.ObjectId;
}

export const BookingSlotSchema = SchemaFactory.createForClass(BookingSlot);

BookingSlotSchema.index({ courtId: 1, startAt: 1 }, { unique: true });
BookingSlotSchema.index({ bookingId: 1 });
