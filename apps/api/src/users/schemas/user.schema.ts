import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ type: String, enum: ['customer', 'staff', 'owner'], default: 'customer' })
  role!: 'customer' | 'staff' | 'owner';

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  @Prop({ type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status!: 'active' | 'inactive' | 'suspended';

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop()
  lastLoginAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, status: 1 });
