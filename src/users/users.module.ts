import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { UserEntity } from '../bigquery/entities/UserEntity';
import { BigQuery } from '@google-cloud/bigquery';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: 'UserRepository',
      useFactory: (bigQuery: BigQuery) => {
        return new BigQueryRepository<UserEntity>(bigQuery, UserEntity);
      },
      inject: [BigQuery, ConfigService],
    },
  ],
  exports: [UsersService, 'UserRepository'],
})
export class UsersModule {}
