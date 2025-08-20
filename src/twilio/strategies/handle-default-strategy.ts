import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_MESSAGES } from '../types/whatsapp';
import { TwilioService } from '../twilio.service';
import { HandleListGamesStrategy } from './handle-list-games-strategy';

@Injectable()
export class HandleDefaultStrategy {
  private readonly logger = new Logger(HandleDefaultStrategy.name);

  constructor(
    private readonly twilioSerice: TwilioService,
    private handleListGameService: HandleListGamesStrategy,
  ) {}

  async execute(userId: string, from: string) {
    this.logger.log(`📋 ===== INICIANDO ESTRATÉGIA PADRÃO =====`);
    this.logger.log(`👤 User ID: ${userId} | Phone: ${from}`);

    try {
      this.logger.log(`📤 Enviando mensagem de opção inválida...`);
      await this.twilioSerice.sendTextWhatsAppMessage(
        DEFAULT_MESSAGES.INVALID_OPTION,
        from,
      );
      this.logger.log(`✅ Mensagem de opção inválida enviada`);

      this.logger.log(`📋 Enviando lista de jogos...`);
      await this.handleListGameService.execute(userId, from);
      this.logger.log(`✅ Lista de jogos enviada`);
      this.logger.log(`📋 ===== ESTRATÉGIA PADRÃO FINALIZADA =====`);
    } catch (error) {
      this.logger.error(`❌ Erro na estratégia padrão: ${error.message}`);
      this.logger.log(`📋 ===== ERRO NA ESTRATÉGIA PADRÃO =====`);
      throw error;
    }
  }
}
