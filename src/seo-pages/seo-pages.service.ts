import { Injectable, Logger } from '@nestjs/common';
import { SeoRequestDto, SeoResponseDto } from './dto/seo-page.dto';
import { PageRepository } from 'src/mongo/repositories/page.repository';

@Injectable()
export class SeoPagesService {
  private readonly logger = new Logger(SeoPagesService.name);
  constructor(private readonly pageRepository: PageRepository) {}

  async getNewsBySlug(seoPageDto: SeoRequestDto): Promise<SeoResponseDto> {
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

  async getMatchesBySlug(seoPageDto: SeoRequestDto): Promise<SeoResponseDto> {
    const { slug_url } = seoPageDto;

    this.logger.log(`Fetching SEO data for slug: ${slug_url}`);

    const matchesPage = await this.pageRepository.findPageBySlug(slug_url);
    if (!matchesPage) {
      this.logger.warn(`No matches page found for slug: ${slug_url}`);
      throw new Error(`No matches page found for slug: ${slug_url}`);
    }

    this.logger.log('Returning matches response');
    return matchesPage;
  }
}
