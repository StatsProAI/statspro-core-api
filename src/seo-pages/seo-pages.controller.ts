import { Controller, Get, Query } from '@nestjs/common';
import { SeoPagesService } from './seo-pages.service';
import {
  SeoRequestDto,
  SeoResponseNewsDto,
  SeoResponseMatchDto,
  SeoResponseSlugNewsDto,
} from './dto/seo-page.dto';
import { Public } from 'src/authentication/decorators/public.decorator';

@Controller('seo-pages')
export class SeoPagesController {
  constructor(private readonly seoPagesService: SeoPagesService) {}

  @Public()
  @Get('news')
  getNewsBySlug(@Query() query: SeoRequestDto): Promise<SeoResponseNewsDto> {
    return this.seoPagesService.getNewsBySlug(query);
  }

  @Public()
  @Get('matches')
  getMatchesBySlug(
    @Query() query: SeoRequestDto,
  ): Promise<SeoResponseMatchDto> {
    return this.seoPagesService.getMatchesBySlug(query);
  }

  @Public()
  @Get('news/slugs')
  getAllNewsPublished(): Promise<SeoResponseSlugNewsDto[]> {
    return this.seoPagesService.getPublishedSlugs();
  }
}
