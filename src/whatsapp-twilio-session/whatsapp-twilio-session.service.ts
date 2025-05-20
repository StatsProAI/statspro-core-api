import { Inject, Injectable } from '@nestjs/common';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { WhatsAppTwilioSessionEntity } from '../bigquery/entities/WhatsAppTwilioSessionEntity';

@Injectable()
export class WhatsappTwilioSessionService {
  constructor(
    @Inject('WhatsappTwilioSessionRepository')
    private readonly repository: BigQueryRepository<WhatsAppTwilioSessionEntity>,
  ) {}

  async createSession(userId: string): Promise<void> {
    const session = new WhatsAppTwilioSessionEntity();
    session.userId = userId;
    session.status = 'INITIALIZED'; 
    await this.repository.insert(session);
  }

  async getLastSessionByUserId(userId: string): Promise<WhatsAppTwilioSessionEntity> {
    const sessions = await this.repository.findAll({
      where: { userId },
      orderBy: { createdAt: 'DESC' },
      limit: 1,
    });
    return sessions[0] || null;
  }

  async updateSession(userId: string, data: Partial<WhatsAppTwilioSessionEntity>): Promise<void> {
    await this.repository.update({ userId }, data);
  }
}
