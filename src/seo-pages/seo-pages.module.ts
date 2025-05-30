import { Module } from '@nestjs/common';
import { SeoPagesService } from './seo-pages.service';
import { SeoPagesController } from './seo-pages.controller';
import { MongoModule } from 'src/mongo/mongo.module';

@Module({
  imports: [MongoModule],
  controllers: [SeoPagesController],
  providers: [SeoPagesService],
})
export class SeoPagesModule {}
