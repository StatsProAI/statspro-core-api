export interface League {
  id: number;
  name: string;
  country_id: number;
  image_path: string;
}

export interface Fixture {
  id: number;
  league: League;
}

