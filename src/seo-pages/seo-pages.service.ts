import { Injectable, Logger } from '@nestjs/common';
import {
  SeoRequestDto,
  SeoResponseNewsDto,
  SeoResponseMatchDto,
  SeoResponseSlugNewsDto,
} from './dto/seo-page.dto';
import { PageRepository } from 'src/mongo/repositories/page.repository';
import { MatchRepository } from 'src/mongo/repositories/match.repository';

@Injectable()
export class SeoPagesService {
  private readonly logger = new Logger(SeoPagesService.name);
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async getNewsBySlug(seoPageDto: SeoRequestDto): Promise<SeoResponseNewsDto> {
    const { slug_url } = seoPageDto;

    this.logger.log(`Fetching SEO data for slug: ${slug_url}`);

    const newsPage = await this.pageRepository.findPageBySlug(slug_url);

    if (!newsPage) {
      this.logger.warn(`No news page found for slug: ${slug_url}`);
      throw new Error(`No news page found for slug: ${slug_url}`);
    }

    this.logger.log('Returning news response');
    return newsPage;
  }

  async getMatchesBySlug(
    seoPageDto: SeoRequestDto,
  ): Promise<SeoResponseMatchDto> {
    const { slug_url } = seoPageDto;

    this.logger.log(`Fetching SEO data for slug: ${slug_url}`);

    const matchesPage = await this.pageRepository.findPageBySlug(slug_url);
    if (!matchesPage) {
      this.logger.warn(`No matches page found for slug: ${slug_url}`);
      throw new Error(`No matches page found for slug: ${slug_url}`);
    }
    let associated_content = null;

    if (matchesPage.associated_content_id) {
      associated_content = await this.matchRepository.findByAssociatedContentId(
        matchesPage.associated_content_id,
      );
      if (!associated_content) {
        this.logger.warn(
          `No associated content found for ID: ${matchesPage.associated_content_id}`,
        );
        throw new Error(
          `No associated content found for ID: ${matchesPage.associated_content_id}`,
        );
      }
      this.logger.log(
        `Associated content found for ID: ${matchesPage.associated_content_id}`,
      );
    }

    this.logger.log('Returning matches response');
    return {
      ...matchesPage,
      associated_content,
    };
  }

  async getPublishedSlugs(): Promise<SeoResponseSlugNewsDto[]> {
    this.logger.log('Fetching all published slugs');
    const publishedPages = await this.pageRepository.findAllPublishedSlugs();
    if (!publishedPages.length) {
      this.logger.warn('No published slugs found');
      return [];
    }
    this.logger.log(`Found ${publishedPages.length} published slugs`);
    return publishedPages.map((page) => ({
      slug_url: page.slug_url,
      title: page.title,
      page_subtitle: page.page_subtitle,
      published_at: page.published_at,
      tags: page.tags || [],
    }));
  }
}
