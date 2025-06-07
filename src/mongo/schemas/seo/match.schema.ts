import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'matchs',
})
export class Match {
  @Prop({ required: true }) match_datetime: Date;
  @Prop({ required: true }) championship_id: string;
  @Prop({ required: true }) home_team_id: string;
  @Prop({ required: true }) away_team_id: string;
  @Prop({ required: true }) match_location: string;
  @Prop({ required: true }) match_status: string;
  @Prop({ required: true }) where_to_watch: string;
  @Prop({ required: true }) referee_info: string;

  @Prop({ type: Object }) probable_lineups: Record<string, string>;
  @Prop({ type: Object }) confirmed_lineups: Record<string, string>;
  @Prop() team_stats_pre_match: string;

  @Prop({ type: Object }) simplified_product_forecast: Record<string, any>;
  @Prop({ type: Object }) full_stats_post_match?: Record<string, any>;
  @Prop({ type: Object }) main_highlights_post_match?: string;

  @Prop() final_score_home?: number;
  @Prop() final_score_away?: number;
}

export type MatchDocument = Match & Document;

export const MatchSchema = SchemaFactory.createForClass(Match);
