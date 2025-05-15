import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SportMonksController } from './sportmonks.controller';
import { SportMonksService } from './sportmonks.service';
import { HttpModule } from '../common/http/http.module';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [SportMonksController],
  providers: [SportMonksService],
  exports: [SportMonksService],
})
export class SportMonksModule {}
