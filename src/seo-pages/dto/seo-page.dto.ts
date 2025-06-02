export class SeoRequestDto {
  slug_url: string;
}

export class SeoResponseDto {
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
