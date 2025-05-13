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
  league: ApiLeague;
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