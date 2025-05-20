import { Injectable } from '@nestjs/common';
import { TwilioService } from '../twilio.service';
import { WhatsappTwilioSessionService } from '../../whatsapp-twilio-session/whatsapp-twilio-session.service';
import {
  DEFAULT_MESSAGES,
  WhatsAppTwilioSessionStatus,
} from '../types/whatsapp';

@Injectable()
export class HandleSuporteStrategy {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
  ) {}

  async execute(userId: string, from: string) {
    await this.twilioService.sendTextWhatsAppMessage(
      DEFAULT_MESSAGES.SUPPORT,
      from,
    );
    await this.whatsappTwilioSessionService.updateSession(userId, {
      status: WhatsAppTwilioSessionStatus.FINALIZED,
      completedBy: 'SUPPORT',
    });
  }
}
