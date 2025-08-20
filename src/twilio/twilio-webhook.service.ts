import { Injectable } from '@nestjs/common';
import { TwilioPayloadDto } from './dto/twilio-payload.dto';
import { UsersService } from '../users/users.service';
import { TwilioService } from './twilio.service';
import { twilioExtractPhoneNumber } from '../common/utils/twilio-extract-phone-number';
import { WhatsAppTwilioSessionStatus } from './types/whatsapp';
import { WhatsappTwilioSessionService } from '../whatsapp-twilio-session/whatsapp-twilio-session.service';
import { WhatsAppTwilioSessionEntity } from '../bigquery/entities/WhatsAppTwilioSessionEntity';
import { differenceInMinutes } from '../common/utils/difference-in-minutes';
import { HandleSuporteStrategy } from './strategies/handle-suport-strategy';
import { HandleListGamesStrategy } from './strategies/handle-list-games-strategy';
import { HandleAnalisyStrategy } from './strategies/handle-analisy-strategy';
import { normalizeText } from '../common/utils/normalize-text';
import { HandleDefaultStrategy } from './strategies/handle-default-strategy';
import { HandleGuestStrategy } from './strategies/handle-guest-strategy';
import { PreUsersService } from '../pre-users/pre-users.service';
import { Logger } from '@nestjs/common';

type Strategy = {
  match: (text: string) => boolean;
  action: (userId: string, from: string, text: string) => Promise<void>;
};

@Injectable()
export class TwilioWebhookService {
  strategies: Strategy[] = [];
  private readonly logger = new Logger(TwilioWebhookService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly twilioService: TwilioService,
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
    private readonly handleSuporteStrategy: HandleSuporteStrategy,
    private readonly handleListGamesStrategy: HandleListGamesStrategy,
    private readonly handleAnalisyStrategy: HandleAnalisyStrategy,
    private readonly handleDefaultStrategy: HandleDefaultStrategy,
    private readonly handleGuestStrategy: HandleGuestStrategy,
    private readonly preUsersService: PreUsersService,
  ) {
    this.strategies = [
      {
        match: (text) => /analise/i.test(text),
        action: (userId: string, from: string, text: string) =>
          this.handleListGamesStrategy.execute(userId, from),
      },
      {
        match: (text) => /suporte/i.test(text),
        action: (userId: string, from: string, text: string) =>
          this.handleSuporteStrategy.execute(userId, from),
      },
      {
        match: (text) => /^\d+$/.test(text), // Apenas números
        action: (userId: string, from: string, text: string) =>
          this.handleAnalisyStrategy.execute(userId, from, text),
      },
    ];
  }

  async processWebhook(payload: TwilioPayloadDto) {
    this.logger.log('🚀 ===== INICIANDO PROCESSAMENTO DO WEBHOOK =====');

    // Validação de entrada
    if (!payload.From || !payload.Body) {
      this.logger.error('❌ Payload inválido: From ou Body ausentes');
      throw new Error('Payload inválido');
    }

    this.logger.log(
      `📥 Payload recebido - From: ${payload.From}, Body: "${payload.Body}"`,
    );

    const phoneNumber = twilioExtractPhoneNumber(payload.From);
    const text: string = normalizeText(payload.Body);

    // Validação do número de telefone
    if (!phoneNumber || phoneNumber.length < 10) {
      this.logger.error(
        `❌ Número de telefone inválido: ${payload.From} -> ${phoneNumber}`,
      );
      throw new Error('Número de telefone inválido');
    }

    this.logger.log(
      `📱 Número processado: ${phoneNumber} | Texto normalizado: "${text}"`,
    );

    // 1. VALIDAR SE O NÚMERO JÁ PERTENCE A UM USUÁRIO
    this.logger.log(
      `🔍 Verificando se ${phoneNumber} é um usuário cadastrado...`,
    );
    const user = await this.usersService.findUserByPhoneNumber(phoneNumber);

    if (user) {
      this.logger.log(
        `✅ Usuário cadastrado encontrado: ${user.firstName} (${user.userId})`,
      );

      // USUÁRIO CADASTRADO - FLUXO NORMAL
      this.logger.log(`📋 Verificando sessão do usuário...`);
      const lastSession: WhatsAppTwilioSessionEntity =
        await this.whatsappTwilioSessionService.getLastSessionByUserId(
          user.userId,
        );
      const validateSessionResponse: {
        isNewSessionCreated: boolean;
      } = await this.validateSession(user.userId, lastSession);

      this.logger.log(
        `🔄 Status da sessão: ${
          validateSessionResponse.isNewSessionCreated ? 'NOVA SESSÃO' : 'SESSÃO EXISTENTE'
        }`,
      );

      const isAnalisy = /analise/i.test(text);
      this.logger.log(`🎯 Tipo de mensagem: ${isAnalisy ? 'ANÁLISE' : 'OUTRA'}`);

      if (validateSessionResponse.isNewSessionCreated && !isAnalisy) {
        this.logger.log(`📤 Enviando menu de boas-vindas para usuário cadastrado`);
        await this.twilioService.sendMenuWhatsAppMessage(
          user.firstName,
          user.phoneNumber,
        );
        this.logger.log('✅ Menu enviado com sucesso');
        return;
      }

      this.logger.log(`🔍 Procurando estratégia para: "${text}"`);
      const strategy = this.strategies.find((s) => s.match(text));
      if (strategy) {
        this.logger.log(`⚡ Executando estratégia encontrada`);
        await strategy.action(user.userId, user.phoneNumber, text);
        this.logger.log('✅ Estratégia executada com sucesso');
      } else {
        this.logger.log(`📋 Nenhuma estratégia encontrada, executando estratégia padrão`);
        await this.handleDefaultStrategy.execute(user.userId, user.phoneNumber);
        this.logger.log('✅ Estratégia padrão executada com sucesso');
      }
      this.logger.log('🏁 ===== FLUXO DE USUÁRIO CADASTRADO FINALIZADO =====');
      return;
    }

    this.logger.log(`❌ Usuário não cadastrado: ${phoneNumber}`);

    // 2. VALIDAR SE ESSE NÚMERO JÁ EXISTE NA TABELA PRE_USERS
    this.logger.log(`🔍 Verificando se ${phoneNumber} já usou análise gratuita...`);
    const preUser = await this.preUsersService.findByPhoneNumber(phoneNumber);

    if (preUser) {
      this.logger.log(
        `🚫 Usuário já usou análise gratuita: ${phoneNumber} (${preUser.analysisCount} análises)`,
      );
      // USUÁRIO JÁ FEZ ANÁLISE GRATUITA - RETORNA MENSAGEM
      await this.sendNoMoreFreeAnalysisMessage(phoneNumber);
      this.logger.log('✅ Mensagem de "já usou análise gratuita" enviada');
      this.logger.log('🏁 ===== FLUXO DE USUÁRIO QUE JÁ USOU ANÁLISE GRATUITA FINALIZADO =====');
      return;
    }

    this.logger.log(`🆕 Novo usuário elegível para análise gratuita: ${phoneNumber}`);

    // 3. NOVO USUÁRIO - PERMITE ANÁLISE GRATUITA
    this.logger.log(`🎁 Iniciando fluxo de análise gratuita para: ${phoneNumber}`);
    await this.handleGuestStrategy.execute(phoneNumber, text);
    this.logger.log('✅ Fluxo de análise gratuita executado');
    this.logger.log('🏁 ===== FLUXO DE NOVO USUÁRIO FINALIZADO =====');
  }

  private async sendNoMoreFreeAnalysisMessage(phoneNumber: string) {
    const message = `🎯 *Análise Gratuita Já Utilizada*

Você já utilizou sua análise gratuita anteriormente. Para continuar recebendo análises detalhadas, cadastre-se agora e ganhe 10 análises gratuitas!

🚀 *Benefícios do cadastro:*
• 10 análises gratuitas
• Acesso a todas as ligas
• Análises em tempo real
• Suporte especializado

👉 *Cadastre-se agora:* https://statspro.ai/sign-up`;

    // Log da mensagem de "já usou análise gratuita"
    this.logger.log('🚫 ===== MENSAGEM: JÁ USOU ANÁLISE GRATUITA =====');
    this.logger.log(message);
    this.logger.log('🚫 ===== FIM DA MENSAGEM =====');

    await this.twilioService.sendTextWhatsAppMessage(message, phoneNumber);
  }

  async validateSession(
    userId: string,
    sessionResponse: WhatsAppTwilioSessionEntity,
  ): Promise<{
    isNewSessionCreated: boolean;
  }> {
    this.logger.log(`📋 ===== VALIDANDO SESSÃO =====`);
    this.logger.log(`👤 User ID: ${userId}`);

    if (
      sessionResponse &&
      sessionResponse.status === WhatsAppTwilioSessionStatus.INITIALIZED
    ) {
      this.logger.log(`✅ Sessão existente encontrada: ${sessionResponse.status}`);
      
      const diffMinutes = await differenceInMinutes(sessionResponse?.createdAt);
      this.logger.log(`⏰ Diferença em minutos: ${diffMinutes} minutos`);

      if (diffMinutes > 360) {
        this.logger.log(`🔄 Sessão expirada (>360 min), finalizando e criando nova...`);
        await this.whatsappTwilioSessionService.updateSession(userId, {
          status: WhatsAppTwilioSessionStatus.FINALIZED,
        });
        this.logger.log(`✅ Sessão anterior finalizada`);

        await this.whatsappTwilioSessionService.createSession(userId);
        this.logger.log(`✅ Nova sessão criada`);
        this.logger.log(`📋 ===== NOVA SESSÃO CRIADA =====`);
        return {
          isNewSessionCreated: true,
        };
      }
      
      this.logger.log(`✅ Sessão válida, mantendo existente`);
      this.logger.log(`📋 ===== SESSÃO VÁLIDA =====`);
      return {
        isNewSessionCreated: false,
      };
    } else {
      this.logger.log(`❌ Nenhuma sessão encontrada, criando nova...`);
      await this.whatsappTwilioSessionService.createSession(userId);
      this.logger.log(`✅ Nova sessão criada`);
      this.logger.log(`📋 ===== NOVA SESSÃO CRIADA =====`);
      return {
        isNewSessionCreated: true,
      };
    }
  }
}
