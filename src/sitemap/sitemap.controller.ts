import { Controller, Get, Res } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { Public } from 'src/authentication/decorators/public.decorator';
import { SitemapResponseDto } from './dto/sitemap.dto';

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Public()
  @Get('news')
  async getNoticiasSitemap(): Promise<SitemapResponseDto[]> {
    return await this.sitemapService.getNewsSitemap();
  }

  @Public()
  @Get('matches')
  async getPartidasSitemap(): Promise<SitemapResponseDto[]> {
    return await this.sitemapService.getMatchesSitemap();
  }
}
