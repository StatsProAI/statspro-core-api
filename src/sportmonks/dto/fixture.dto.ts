export interface League {
  id: number;
  name: string;
  country_id: number;
  image_path: string;
}

export interface Participant {
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

export interface Lineup {
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

export interface TvStation {
  id: number;
  fixture_id: number;
  tvstation_id: number;
  country_id: number;
}

export interface Formation {
  id: number;
  fixture_id: number;
  participant_id: number;
  formation: string;
  location: string;
}

export interface Fixture {
  id: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number;
  group_id?: number | null;
  aggregate_id?: number | null;
  round_id?: number | null;
  state_id?: number;
  venue_id?: number;
  name?: string;
  starting_at?: string;
  result_info?: any | null;
  leg?: string;
  details?: any | null;
  length?: number;
  placeholder?: boolean;
  has_odds?: boolean;
  has_premium_odds?: boolean;
  starting_at_timestamp?: number;
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

