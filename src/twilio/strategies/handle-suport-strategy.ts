import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../twilio.service';
import { WhatsappTwilioSessionService } from '../../whatsapp-twilio-session/whatsapp-twilio-session.service';
import {
  DEFAULT_MESSAGES,
  WhatsAppTwilioSessionStatus,
} from '../types/whatsapp';

@Injectable()
export class HandleSuporteStrategy {
  private readonly logger = new Logger(HandleSuporteStrategy.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
  ) {}

  async execute(userId: string, from: string) {
    this.logger.log(`🆘 ===== INICIANDO ESTRATÉGIA DE SUPORTE =====`);
    this.logger.log(`👤 User ID: ${userId} | Phone: ${from}`);

    try {
      this.logger.log(`📤 Enviando mensagem de suporte...`);
      await this.twilioService.sendTextWhatsAppMessage(
        DEFAULT_MESSAGES.SUPPORT,
        from,
      );
      this.logger.log(`✅ Mensagem de suporte enviada`);

      this.logger.log(`📋 Atualizando sessão para FINALIZED...`);
      await this.whatsappTwilioSessionService.updateSession(userId, {
        status: WhatsAppTwilioSessionStatus.FINALIZED,
        completedBy: 'SUPPORT',
      });
      this.logger.log(`✅ Sessão atualizada para FINALIZED`);
      this.logger.log(`🆘 ===== ESTRATÉGIA DE SUPORTE FINALIZADA =====`);
    } catch (error) {
      this.logger.error(`❌ Erro na estratégia de suporte: ${error.message}`);
      this.logger.log(`🆘 ===== ERRO NA ESTRATÉGIA DE SUPORTE =====`);
      throw error;
    }
  }
}
