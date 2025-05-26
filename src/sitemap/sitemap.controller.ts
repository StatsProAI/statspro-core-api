import { Controller, Get, Res } from '@nestjs/common';
import { SitemapService } from './sitemap.service';
import { Response } from 'express';
import { Public } from 'src/authentication/decorators/public.decorator';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}


  @Public()
  @Get('sitemap.xml')
  getSitemapIndex(@Res() res: Response): void {
    console.log('Generating sitemap index');
    const xml = this.sitemapService.generateSitemapIndex();
    res.send(xml);
  }


@Public()
@Get('sitemap-noticias.xml')
  async getNoticiasSitemap(@Res() res: Response) {
    const xml = await this.sitemapService.generateNoticiasSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }

  @Public()
  @Get('sitemap-partidas.xml')
  async getPartidasSitemap(@Res() res: Response){
   const xml = await this.sitemapService.generatePartidasSitemap();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  }
}
