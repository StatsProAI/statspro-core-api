import { Module } from '@nestjs/common';
import { SportMonksService } from './sportmonks.service';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksApiClient } from './clients/sportmonks-api.client';
import { FixturesRepository } from './repositories/fixtures.repository';
import { SportMonksConfig } from './config/sportmonks.config';

@Module({
  controllers: [SportMonksController],
  providers: [
    SportMonksConfig,
    SportMonksApiClient,
    FixturesRepository,
    SportMonksService,
  ],
  exports: [SportMonksService],
})
export class SportMonksModule {} 