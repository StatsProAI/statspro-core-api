import { Global, Module } from '@nestjs/common';
import { BigQuery } from '@google-cloud/bigquery';
import { ConfigService } from '@nestjs/config';
import { BigqueryService } from './bigquery.service';

@Global()
@Module({
  providers: [
    {
      provide: BigQuery,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const credentialsString =
          configService.get<string>('GOOGLE_CREDENTIALS');
        const credentials = JSON.parse(credentialsString);
        return new BigQuery({
          credentials,
          projectId: credentials.project_id,
        });
      },
    },
    BigqueryService,
  ],
  exports: [BigQuery, BigqueryService],
})
export class BigqueryModule {}
