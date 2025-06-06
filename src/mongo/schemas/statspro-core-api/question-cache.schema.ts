import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RefSource } from '../../enum/ref-source.enum';

@Schema({
  collection: 'question_cache',
})
export class QuestionCache {
  @Prop({ required: true, index: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ required: true })
  created_at: Date;

  @Prop()
  game_time?: string;

  @Prop({ enum: RefSource })
  ref_resource?: RefSource;
}

export type QuestionCacheDocument = QuestionCache & Document;

export const QuestionCacheSchema = SchemaFactory.createForClass(QuestionCache);
