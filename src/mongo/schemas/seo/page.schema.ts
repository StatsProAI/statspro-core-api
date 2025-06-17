import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'pages',
})
export class Page {
  @Prop({ required: true }) slug_url: string;

  @Prop({ type: [String], required: true })
  tags: string[];

  @Prop({ required: true }) meta_title: string;
  @Prop({ required: true }) meta_description: string;
  @Prop({ required: true }) title_h1: string;
  @Prop({ required: true }) page_subtitle: string;
  @Prop({ required: true }) body_content: string;
  @Prop({ required: true }) author_name: string;
  @Prop({ required: true }) published_at: Date;
  @Prop({ required: true }) last_updated_at: Date;
  @Prop({ required: true }) main_event_date: Date;
  @Prop({ required: true }) page_status: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) page_type: string;
  @Prop({ required: false }) associated_content_id: string;
}

export type PageDocument = Page & Document;

export const PageSchema = SchemaFactory.createForClass(Page);
