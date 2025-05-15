import { Module } from '@nestjs/common';
import { WhatsappTwilioSessionService } from './whatsapp-twilio-session.service';
import { BigQuery } from '@google-cloud/bigquery';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { WhatsAppTwilioSessionEntity } from '../bigquery/entities/WhatsAppTwilioSessionEntity';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    WhatsappTwilioSessionService,
    {
      provide: 'WhatsappTwilioSessionRepository',
      useFactory: (bigQuery: BigQuery) => {
        return new BigQueryRepository<WhatsAppTwilioSessionEntity>(
          bigQuery,
          WhatsAppTwilioSessionEntity,
        );
      },
      inject: [BigQuery, ConfigService],
    },
  ],
  exports: [WhatsappTwilioSessionService],
})
export class WhatsappTwilioSessionModule {}
