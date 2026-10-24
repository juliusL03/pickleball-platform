import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourtDocument = Court & Document;

@Schema({ timestamps: true })
export class Court {
  @Prop({ type: Types.ObjectId, ref: 'Venue', required: true })
  venueId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop()
  description?: string;

  @Prop([String])
  amenities!: string[];

  @Prop([String])
  images!: string[];

  @Prop({ type: Array })
  pricing!: Array<{
    duration: number;
    price: number;
    isActive: boolean;
  }>;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: 0 })
  sortOrder!: number;
}

export const CourtSchema = SchemaFactory.createForClass(Court);

CourtSchema.index({ venueId: 1, isActive: 1, sortOrder: 1 });
CourtSchema.index({ slug: 1 }, { unique: true });
