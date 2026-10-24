import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Booking', required: true, index: true })
  bookingId!: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: 'PHP' })
  currency!: string;

  @Prop({ required: true, enum: ['gcash', 'maya', 'qrph', 'gateway', 'bank_transfer'] })
  method!: string;

  @Prop({
    required: true,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
  })
  status!: string;

  @Prop({ type: Object })
  gateway?: {
    provider?: string;
    transactionId?: string;
    referenceNumber?: string;
    fee?: number;
  };

  @Prop({ type: Object })
  bankTransfer?: {
    bankName?: string;
    accountName?: string;
    referenceNumber?: string;
    proofImageUrl?: string;
    verifiedBy?: MongooseSchema.Types.ObjectId;
    verifiedAt?: Date;
    notes?: string;
  };

  @Prop()
  paidAt?: Date;

  @Prop()
  refundedAt?: Date;

  @Prop()
  refundAmount?: number;

  @Prop()
  refundReason?: string;

  @Prop({ type: [{ eventId: String, receivedAt: Date, processed: Boolean }], default: [] })
  webhookEvents!: Array<{ eventId: string; receivedAt: Date; processed: boolean }>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1, status: 1, createdAt: -1 });
PaymentSchema.index({ 'gateway.transactionId': 1 }, { sparse: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
