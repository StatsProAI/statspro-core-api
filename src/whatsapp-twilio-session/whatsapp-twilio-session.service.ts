import { Inject, Injectable } from '@nestjs/common';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { WhatsAppTwilioSessionEntity } from '../bigquery/entities/WhatsAppTwilioSessionEntity';

@Injectable()
export class WhatsappTwilioSessionService {
  constructor(
    @Inject('WhatsappTwilioSessionRepository')
    private readonly repository: BigQueryRepository<WhatsAppTwilioSessionEntity>,
  ) {}

  async createSession() {}
}
