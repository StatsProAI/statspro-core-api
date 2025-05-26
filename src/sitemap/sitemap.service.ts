import { Injectable } from '@nestjs/common';

@Injectable()
export class SitemapService {
  generateSitemapIndex(): string {
    const now = new Date().toISOString();
    const urls = [
      { loc: 'https://statspro.ai/noticias.sitemap.xml', lastmod: now },
      { loc: 'https://statspro.ai/partidas.sitemap.xml', lastmod: now },
    ];

    const sitemapEntries = urls
      .map(
        (url) => `
  <sitemap>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
  </sitemap>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`;
  }

  async generateNoticiasSitemap(): Promise<string> {
    const noticias = [
      {
        slug: 'noticia-1',
        updatedAt: new Date(),
        changefreq: 'daily',
        priority: '1.0',
      },
      {
        slug: 'noticia-2',
        updatedAt: new Date(),
        changefreq: 'weekly',
        priority: '0.8',
      },
    ];

    const urls = noticias
      .map(
        (noticia) => `
  <url>
    <loc>https://statspro.ai/noticia/${noticia.slug}</loc>
    <lastmod>${new Date(noticia.updatedAt).toISOString()}</lastmod>
    <changefreq>${noticia.changefreq}</changefreq>
    <priority>${noticia.priority}</priority>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
  }

  async generatePartidasSitemap(): Promise<string> {
    // const partidas = await this.partidaRepository.findAll();
    const partidas = [
      { slug: 'partida-1', updatedAt: new Date() },
      { slug: 'partida-2', updatedAt: new Date() },
    ];

    const urls = partidas
      .map(
        (partida) => `
  <url>
    <loc>https://statspro.ai/partida/${partida.slug}</loc>
    <lastmod>${new Date(partida.updatedAt).toISOString()}</lastmod>
  </url>`,
      )
      .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
  }
}
