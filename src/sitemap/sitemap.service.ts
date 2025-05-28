import { Injectable, Logger } from '@nestjs/common';
import { PageType } from 'src/mongo/enum/page-type.enum';
import { SitemapResponseDto } from './dto/sitemap.dto';
import { PageRepository } from 'src/mongo/repositories/page.repository';

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name);
  constructor(private readonly pageRepository: PageRepository) {}

  async getNewsSitemap(): Promise<SitemapResponseDto[]> {
    this.logger.log('Starting news sitemap generation');

    try {
      const pages = await this.pageRepository.findPagesByType(PageType.NEWS);
      this.logger.log(`Found ${pages.length} news pages`);

      const sitemapPages = pages.map((page) => ({
        slug: page.slug_url,
        updatedAt: page.last_updated_at,
        changefreq: 'monthly',
        priority: '0.8',
      }));

      this.logger.log('News sitemap generated successfully');
      return sitemapPages;
    } catch (error) {
      this.logger.error('Failed to generate news sitemap', error.stack);
      throw error;
    }
  }

  async getMatchesSitemap(): Promise<SitemapResponseDto[]> {
    this.logger.log('Starting matches sitemap generation');
    try {
      const matches = await this.pageRepository.findPagesByType([
        PageType.PRE_MATCH,
        PageType.POST_MATCH,
      ]);
      this.logger.log(`Found ${matches.length} news matches`);

      const sitemapMatches = matches.map((match) => ({
        slug: match.slug_url,
        updatedAt: match.last_updated_at,
        changefreq: 'monthly',
        priority: '0.9',
      }));
      this.logger.log('Matches sitemap generated successfully');

      return sitemapMatches;
    } catch (error) {
      this.logger.error('Failed to generate matches sitemap', error.stack);
      throw error;
    }
  }
}
