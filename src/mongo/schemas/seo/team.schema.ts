import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Team {
  @Prop({ required: true }) external_id: number;
  @Prop({ required: true }) gender: string;
  @Prop({ required: true }) short_code: string;
  @Prop({ required: true }) image_path: string;
  @Prop({ required: true }) name: string;
}

export type TeamDocument = Team & Document;

export const TeamSchema = SchemaFactory.createForClass(Team);