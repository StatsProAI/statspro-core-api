import { Injectable } from '@nestjs/common';
import { DEFAULT_MESSAGES } from '../types/whatsapp';
import { TwilioService } from '../twilio.service';
import { HandleListGamesStrategy } from './handle-list-games-strategy';

@Injectable()
export class HandleDefaultStrategy {
  constructor(
    private readonly twilioSerice: TwilioService,
    private handleListGameService: HandleListGamesStrategy,
  ) {}

  async execute(userId: string, from: string) {
    await this.twilioSerice.sendTextWhatsAppMessage(
      DEFAULT_MESSAGES.INVALID_OPTION,
      from,
    );
    await this.handleListGameService.execute(userId, from);
  }
}
