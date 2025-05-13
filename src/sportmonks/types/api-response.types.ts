/**
 * Tipos que representam a estrutura da resposta da API SportMonks
 */

export interface ApiLeague {
  id: number;
  sport_id: number;
  country_id: number;
  name: string;
  active: boolean;
  short_code: string;
  image_path: string;
  type: string;
  sub_type: string;
  last_played_at: string;
  category: number;
  has_jerseys: boolean;
}

export interface ApiParticipant {
  id: number;
  sport_id: number;
  country_id: number;
  venue_id: number;
  gender: string;
  name: string;
  short_code: string;
  image_path: string;
  founded: number | null;
  type: string;
  placeholder: boolean;
  last_played_at: string;
  meta: {
    location: string;
    winner: boolean | null;
    position: number;
  };
}

export interface ApiLineup {
  id: number;
  sport_id: number;
  fixture_id: number;
  player_id: number;
  team_id: number;
  position_id: number;
  formation_field: string;
  type_id: number;
  formation_position: number;
  player_name: string;
  jersey_number: number;
}

export interface ApiTvStation {
  id: number;
  fixture_id: number;
  tvstation_id: number;
  country_id: number;
}

export interface ApiFormation {
  id: number;
  fixture_id: number;
  participant_id: number;
  formation: string;
  location: string;
}

export interface ApiFixture {
  id: number;
  sport_id: number;
  league_id: number;
  season_id: number;
  stage_id: number;
  group_id: number | null;
  aggregate_id: number | null;
  round_id: number | null;
  state_id: number;
  venue_id: number;
  name: string;
  starting_at: string;
  result_info: any | null;
  leg: string;
  details: any | null;
  length: number;
  placeholder: boolean;
  has_odds: boolean;
  has_premium_odds: boolean;
  starting_at_timestamp: number;
  league?: ApiLeague;
  participants?: ApiParticipant[];
  statistics?: any[];
  timeline?: any[];
  events?: any[];
  lineups?: ApiLineup[];
  tvStations?: ApiTvStation[];
  scores?: any[];
  formations?: ApiFormation[];
}

export interface ApiPaginationMeta {
  count: number;
  per_page: number;
  current_page: number;
  next_page: string | null;
  has_more: boolean;
}

export interface ApiFixtureResponse {
  data: ApiFixture[];
  pagination: ApiPaginationMeta;
} 