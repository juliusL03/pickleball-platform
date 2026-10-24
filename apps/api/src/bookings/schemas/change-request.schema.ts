import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChangeRequestDocument = ChangeRequest & Document;

@Schema({ timestamps: true })
export class ChangeRequest {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: String, enum: ['change', 'cancel'], required: true })
  type!: 'change' | 'cancel';

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: 'pending' | 'approved' | 'rejected';

  @Prop({ type: Object })
  requestedChanges?: {
    newStartTime?: Date;
    newDuration?: number;
    newCourtId?: string;
  };

  @Prop({ required: true })
  reason!: string;

  @Prop()
  staffResponse?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;
}

export const ChangeRequestSchema = SchemaFactory.createForClass(ChangeRequest);

ChangeRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
ChangeRequestSchema.index({ bookingId: 1 });
ChangeRequestSchema.index({ status: 1, createdAt: 1 });
