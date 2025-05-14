import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksService } from './sportmonks.service';
import { SportMonksApiRepository } from './repositories/sportmonks-api.repository';
import { SportMonksConfig } from './config/sportmonks.config';

@Module({
  imports: [ConfigModule],
  controllers: [SportMonksController],
  providers: [
    SportMonksConfig,
    SportMonksApiRepository,
    SportMonksService,
  ],
  exports: [SportMonksService],
})
export class SportMonksModule {}
