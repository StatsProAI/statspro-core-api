import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'pre_users',
})
export class PreUser {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, default: 1 })
  analysisCount: number;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt: Date;
}

export type PreUserDocument = PreUser & Document;
export const PreUserSchema = SchemaFactory.createForClass(PreUser);
