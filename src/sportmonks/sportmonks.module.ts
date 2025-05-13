import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksService } from './sportmonks.service';
import { SportMonksApiClient } from './clients/sportmonks-api.client';
import { FixturesRepository } from './repositories/fixtures.repository';
import { SportMonksConfig } from './config/sportmonks.config';

@Module({
  imports: [ConfigModule],
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