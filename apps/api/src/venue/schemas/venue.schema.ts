import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VenueDocument = Venue & Document;

@Schema({ timestamps: true })
export class Venue {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  address!: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
  };

  @Prop({ type: Object })
  contact!: {
    phone?: string;
    email?: string;
  };

  @Prop({ type: Object })
  location?: {
    lat?: number;
    lng?: number;
    mapEmbedUrl?: string;
  };

  @Prop()
  logoUrl?: string;

  @Prop([String])
  images?: string[];

  @Prop({ type: Array })
  operatingHours?: Array<{
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;

  @Prop()
  timezone?: string;

  @Prop({ type: Object })
  settings?: Record<string, any>;
}

export const VenueSchema = SchemaFactory.createForClass(Venue);
