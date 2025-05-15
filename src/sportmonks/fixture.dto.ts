import { 
  ApiLeague, 
  ApiParticipant, 
  ApiLineup, 
  ApiTvStation, 
  ApiFormation,
  ApiFixture
} from './api-response.types';

// Definir apenas o que é diferente ou o que precisa ser exposto
export interface League extends Pick<ApiLeague, 'id' | 'name' | 'country_id' | 'image_path'> {}

export interface Participant extends ApiParticipant {}

export interface Lineup extends ApiLineup {}

export interface TvStation extends ApiTvStation {}

export interface Formation extends ApiFormation {}

export interface Fixture {
  id: number;
  sport_id?: ApiFixture['sport_id'];
  league_id?: ApiFixture['league_id'];
  season_id?: ApiFixture['season_id'];
  stage_id?: ApiFixture['stage_id'];
  group_id?: ApiFixture['group_id'];
  aggregate_id?: ApiFixture['aggregate_id'];
  round_id?: ApiFixture['round_id'];
  state_id?: ApiFixture['state_id'];
  venue_id?: ApiFixture['venue_id'];
  name?: ApiFixture['name'];
  starting_at?: ApiFixture['starting_at'];
  result_info?: ApiFixture['result_info'];
  leg?: ApiFixture['leg'];
  details?: ApiFixture['details'];
  length?: ApiFixture['length'];
  placeholder?: ApiFixture['placeholder'];
  has_odds?: ApiFixture['has_odds'];
  has_premium_odds?: ApiFixture['has_premium_odds'];
  starting_at_timestamp?: ApiFixture['starting_at_timestamp'];
  league?: League;
  participants?: Participant[];
  statistics?: any[];
  timeline?: any[];
  events?: any[];
  lineups?: Lineup[];
  tvStations?: TvStation[];
  scores?: any[];
  formations?: Formation[];
}
