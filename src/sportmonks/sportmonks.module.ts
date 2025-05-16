import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksService } from './sportmonks.service';
import { SportMonksRepository } from './sportmonks.repository';
import { SportMonksConfig } from './sportmonks.config';
import { HttpModule } from '../common/http/http.module';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [SportMonksController],
  providers: [SportMonksService, SportMonksRepository, SportMonksConfig],
  exports: [SportMonksService],
})
export class SportMonksModule {}
