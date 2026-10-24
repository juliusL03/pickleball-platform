import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BlockedSlotDocument = BlockedSlot & Document;

@Schema({ timestamps: true })
export class BlockedSlot {
  @Prop({ type: Types.ObjectId, ref: 'Court' })
  courtId?: Types.ObjectId;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ required: true })
  reason!: string;

  @Prop({
    type: String,
    enum: ['holiday', 'maintenance', 'private_event', 'other'],
    default: 'other',
  })
  type!: 'holiday' | 'maintenance' | 'private_event' | 'other';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const BlockedSlotSchema = SchemaFactory.createForClass(BlockedSlot);

BlockedSlotSchema.index({ courtId: 1, startTime: 1, endTime: 1 });
BlockedSlotSchema.index({ startTime: 1, endTime: 1 });
