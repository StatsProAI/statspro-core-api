import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksService } from './sportmonks.service';

@Module({
  imports: [ConfigModule],
  controllers: [SportMonksController],
  providers: [SportMonksService],
  exports: [SportMonksService],
})
export class SportMonksModule {}
