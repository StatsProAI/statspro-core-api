import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Match, MatchDocument } from '../schemas/match.schema';
import { Model } from 'mongoose';

@Injectable()
export class MatchRepository {
  constructor(
    @InjectModel(Match.name) private matchModel: Model<MatchDocument>,
  ) {}

  async findByAssociatedContentId(id: string): Promise<Match | null> {
    return this.matchModel
      .findById(id)
      .select(
        'match_datetime championship_id home_team_id away_team_id match_location match_status where_to_watch referee_info probable_lineups confirmed_lineups team_stats_pre_match full_stats_post_match simplified_product_forecast',
      )
      .lean()
      .exec();
  }
}
