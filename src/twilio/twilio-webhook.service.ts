import { Injectable } from '@nestjs/common';
import { TwilioPayloadDto } from './dto/twilio-payload.dto';
import { UsersService } from '../users/users.service';
import { TwilioService } from './twilio.service';
import { twilioExtractPhoneNumber } from '../common/utils/twilio-extract-phone-number';
import {
  DEFAULT_MESSAGES,
  WhatsAppTwilioSessionStatus,
} from './types/whatsapp';
import { WhatsappTwilioSessionService } from '../whatsapp-twilio-session/whatsapp-twilio-session.service';
import { WhatsAppTwilioSessionEntity } from '../bigquery/entities/WhatsAppTwilioSessionEntity';
import { differenceInMinutes } from '../common/utils/difference-in-minutes';
import { HandleSuporteStrategy } from './strategies/handle-suport-strategy';
import { HandleListGamesStrategy } from './strategies/handle-list-games-strategy';
import { HandleAnalisyStrategy } from './strategies/handle-analisy-strategy';
import { normalizeText } from '../common/utils/normalize-text';
import { HandleDefaultStrategy } from './strategies/handle-default-strategy';

type Strategy = {
  match: (text: string) => boolean;
  action: (userId: string, from: string, text: string) => Promise<void>;
};

@Injectable()
export class TwilioWebhookService {
  strategies: Strategy[] = [];

  constructor(
    private readonly usersService: UsersService,
    private readonly twilioService: TwilioService,
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
    private readonly handleSuporteStrategy: HandleSuporteStrategy,
    private readonly handleListGamesStrategy: HandleListGamesStrategy,
    private readonly handleAnalisyStrategy: HandleAnalisyStrategy,
    private readonly handleDefaultStrategy: HandleDefaultStrategy,
  ) {
    this.strategies = [
      {
        match: (text) => /analise/i.test(text),
        action: (userId: string, from: string, text: string) => this.handleListGamesStrategy.execute(userId, from),
      },
      {
        match: (text) => /suporte/i.test(text),
        action: (userId: string, from: string, text: string) => this.handleSuporteStrategy.execute(userId, from),
      },
      {
        match: (text) => /^\d+$/.test(text), // Apenas números
        action: (userId: string, from: string, text: string) => this.handleAnalisyStrategy.execute(userId, from, text),
      },
    ];
  }

  async processWebhook(payload: TwilioPayloadDto) {
    const phoneNumer = twilioExtractPhoneNumber(payload.From);
    
    if(payload.From !== 'whatsapp:+554792714236') {
      await this.twilioService.sendTextWhatsAppMessage(
        'Oi, tudo bem? Estamos em manutenção. Por favor, entre em contato com o suporte.',
        phoneNumer,
      );
      return;
    }
    
    const user = await this.usersService.findUserByPhoneNumber(phoneNumer);

    if (!user) {
      await this.twilioService.sendTextWhatsAppMessage(
        DEFAULT_MESSAGES.NOT_HAVE_ACCOUNT,
        payload.From,
      );
      return;
    }

    const lastSession: WhatsAppTwilioSessionEntity =
      await this.whatsappTwilioSessionService.getLastSessionByUserId(
        user.userId,
      );
    const validateSessionResponse: {
      isNewSessionCreated: boolean;
    } = await this.validateSession(user.userId, lastSession);

    if (validateSessionResponse.isNewSessionCreated) {
      await this.twilioService.sendMenuWhatsAppMessage(
        user.firstName,
        user.phoneNumber,
      );
      return;
    }

    const text: string = normalizeText(payload.Body);
    const strategy = this.strategies.find((s) => s.match(text));
    if (strategy) {
      await strategy.action(user.userId, user.phoneNumber, text);
    } else {
      await this.handleDefaultStrategy.execute(user.userId, user.phoneNumber);
    }
  }

  async validateSession(
    userId: string,
    sessionResponse: WhatsAppTwilioSessionEntity,
  ): Promise<{
    isNewSessionCreated: boolean;
  }> {
    if (
      sessionResponse &&
      sessionResponse.status === WhatsAppTwilioSessionStatus.INITIALIZED
    ) {
      const diffMinutes = await differenceInMinutes(sessionResponse?.createdAt);
      if (diffMinutes > 360) {
        await this.whatsappTwilioSessionService.updateSession(userId, {
          status: WhatsAppTwilioSessionStatus.FINALIZED,
        });
        await this.whatsappTwilioSessionService.createSession(userId);
        return {
          isNewSessionCreated: true,
        };
      }
      return {
        isNewSessionCreated: false,
      };
    } else {
      await this.whatsappTwilioSessionService.createSession(userId);
      return {
        isNewSessionCreated: true,
      };
    }
  }
}
