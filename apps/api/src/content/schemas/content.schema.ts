import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContentDocument = Content & Document;

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  key!: string;

  @Prop({ type: String, enum: ['page', 'announcement', 'promotion', 'setting'], required: true })
  type!: 'page' | 'announcement' | 'promotion' | 'setting';

  @Prop()
  title?: string;

  @Prop({ type: Object, required: true })
  content!: Record<string, any>;

  @Prop({ default: false })
  isPublished!: boolean;

  @Prop()
  publishedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;
}

export const ContentSchema = SchemaFactory.createForClass(Content);

ContentSchema.index({ key: 1 }, { unique: true });
ContentSchema.index({ type: 1, isPublished: 1 });
