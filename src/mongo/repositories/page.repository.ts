import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Page, PageDocument } from '../schemas/page.schema';
import { Model } from 'mongoose';
import { PageType } from '../enum/page-type.enum';

@Injectable()
export class PageRepository {
  constructor(@InjectModel(Page.name) private pageModel: Model<PageDocument>) {}

  async findPagesByType(pageType: PageType | PageType[]): Promise<Page[]> {
    const pageTypeFilter = Array.isArray(pageType)
      ? { page_type: { $in: pageType } }
      : { page_type: pageType };

    return this.pageModel
      .find(
      { ...pageTypeFilter, page_status: 'published' },
      {
        slug_url: 1,
        page_type: 1,
        last_updated_at: 1,
        _id: 0,
      }
      )
      .sort({ published_at: -1 })
      .lean()
      .exec();
  }

  async findPageBySlug(slug: string): Promise<Page | null> {
    return this.pageModel
      .findOne({ slug_url: slug, page_status: 'published' })
      .select(
        'slug_url tags page_type meta_title meta_description title_h1 page_subtitle body_content author_name published_at last_updated_at main_event_date page_status title associated_content_id',
      )
      .lean()
      .exec();
  }

  async create(data: Partial<Page>): Promise<Page> {
    return this.pageModel.create(data);
  }

  async findAllPublishedSlugs(): Promise<{ slug_url: string; title: string; tags: string[]; page_subtitle: string; published_at: Date }[]> {
    return this.pageModel
      .find(
        { page_status: 'published' },
        { slug_url: 1, title: 1, tags: 1, page_subtitle: 1, published_at: 1, _id: 0 }
      )
      .sort({ published_at: -1 })
      .lean()
      .exec();
  }

  async findById(id: string): Promise<Page | null> {
    return this.pageModel.findById(id).exec();
  }
}
