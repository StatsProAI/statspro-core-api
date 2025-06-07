export class SeoRequestDto {
  slug_url: string;
}

export class SeoResponseNewsDto {
  slug_url: string;
  tags: string[];
  page_type: string;
  meta_title: string;
  meta_description: string;
  title_h1: string;
  page_subtitle: string;
  body_content: string;
  author_name: string;
  published_at: Date;
  last_updated_at: Date;
  main_event_date: Date;
  page_status: string;
  title: string;
}

export class SeoResponseMatchDto {
  slug_url: string;
  tags: string[];
  page_type: string;
  meta_title: string;
  meta_description: string;
  title_h1: string;
  page_subtitle: string;
  body_content: string;
  author_name: string;
  published_at: Date;
  last_updated_at: Date;
  main_event_date: Date;
  page_status: string;
  title: string;
  associated_content_id?: string;
  associated_content: AssociatedMatchContentDto;
}

export class AssociatedMatchContentDto {
  match_datetime: Date;
  championship_id: string;
  home_team_id: string;
  away_team_id: string;
  match_location: string;
  match_status: string;
  where_to_watch: string;
  referee_info: string;
  probable_lineups: Record<string, string>;
  confirmed_lineups: Record<string, string>;
  team_stats_pre_match: string;
  simplified_product_forecast: Record<string, any>;
  full_stats_post_match?: Record<string, any>;
  main_highlights_post_match?: string;
  final_score_home?: number;
  final_score_away?: number;
}

export class SeoResponseSlugNewsDto {
  slug_url: string;
}