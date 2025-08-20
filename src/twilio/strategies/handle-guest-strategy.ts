import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../twilio.service';
import { HandleListGamesStrategy } from './handle-list-games-strategy';
import { UsersService } from '../../users/users.service';
import { QuestionCacheService } from '../../question-cache/question-cache.service';
import { AuroraService } from '../../aurora/aurora.service';
import { QuestionCacheEntity } from '../../bigquery/entities/QuestionCacheEntity';
import { twilioExtractGameText } from '../../common/utils/twilio-extract-game-text';
import { normalizeText } from '../../common/utils/normalize-text';
import { PreUsersService } from '../../pre-users/pre-users.service';

@Injectable()
export class HandleGuestStrategy {
  private readonly logger = new Logger(HandleGuestStrategy.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly handleListGamesStrategy: HandleListGamesStrategy,
    private readonly usersService: UsersService,
    private readonly questionCacheService: QuestionCacheService,
    private readonly auroraService: AuroraService,
    private readonly preUsersService: PreUsersService,
  ) {}

  async execute(phoneNumber: string, text: string) {
    this.logger.log(
      `🎁 ===== INICIANDO FLUXO DE USUÁRIO GUEST =====`,
    );
    this.logger.log(
      `📱 Processando mensagem de guest: "${text}" de ${phoneNumber}`,
    );

    const normalizedText = normalizeText(text);
    this.logger.log(`🔄 Texto normalizado: "${normalizedText}"`);

    // Verifica se é uma solicitação de análise
    if (/analise/i.test(normalizedText)) {
      this.logger.log(`📋 Usuário solicitou análise - enviando lista de jogos`);
      await this.handleListGamesStrategy.execute(null, phoneNumber);
      this.logger.log(`✅ Lista de jogos enviada com sucesso`);
      return;
    }

    // Verifica se é um número (seleção de jogo)
    if (/^\d+$/.test(normalizedText)) {
      this.logger.log(`🎯 Usuário selecionou jogo número: ${normalizedText}`);
      await this.handleGuestAnalisy(phoneNumber, normalizedText);
      return;
    }

    // Verifica se é suporte
    if (/suporte/i.test(normalizedText)) {
      this.logger.log(`🆘 Usuário solicitou suporte`);
      await this.twilioService.sendTextWhatsAppMessage(
        'Para entrar em contato com o suporte humano, você pode enviar uma mensagem para o WhatsApp (21) 99342-9306. Estamos à disposição para te ajudar!',
        phoneNumber,
      );
      this.logger.log(`✅ Mensagem de suporte enviada`);
      return;
    }

    // Mensagem padrão para guest users
    this.logger.log(`📝 Enviando mensagem de boas-vindas padrão`);
    await this.sendGuestWelcomeMessage(phoneNumber);
    this.logger.log(`✅ Mensagem de boas-vindas enviada`);
    this.logger.log(`🏁 ===== FLUXO DE USUÁRIO GUEST FINALIZADO =====`);
  }

  private async handleGuestAnalisy(
    phoneNumber: string,
    selectedNumber: string,
  ) {
    this.logger.log(
      `🎯 ===== INICIANDO ANÁLISE GRATUITA =====`,
    );
    this.logger.log(
      `📱 Guest user ${phoneNumber} selecionou jogo número: ${selectedNumber}`,
    );

    this.logger.log(`🔍 Buscando última mensagem para obter lista de jogos...`);
    const lastMessage = await this.twilioService.getLastMessage(phoneNumber);
    if (!lastMessage?.body) {
      this.logger.log(`❌ Nenhuma mensagem anterior encontrada, enviando boas-vindas`);
      await this.sendGuestWelcomeMessage(phoneNumber);
      return;
    }

    this.logger.log(`📋 Última mensagem encontrada: "${lastMessage.body.substring(0, 100)}..."`);

    const jogosDesejado = twilioExtractGameText(lastMessage.body);
    const index = Number(selectedNumber) - 1;

    this.logger.log(`🎮 Jogos extraídos: ${jogosDesejado.length} jogos encontrados`);
    this.logger.log(`📊 Índice selecionado: ${index} (número: ${selectedNumber})`);

    if (index >= 0 && index < jogosDesejado.length) {
      const jogoDesejado = jogosDesejado[index];
      this.logger.log(
        `⚽ Jogo selecionado para análise: ${JSON.stringify(jogoDesejado)}`,
      );

      // Envia mensagem imediata para evitar timeout do webhook
      this.logger.log(`⏳ Enviando mensagem de processamento...`);
      await this.twilioService.sendTextWhatsAppMessage(
        '⏳ Processando sua análise gratuita... Aguarde um momento!',
        phoneNumber,
      );
      this.logger.log(`✅ Mensagem de processamento enviada`);

      // Processa a análise em background
      this.logger.log(`🔄 Iniciando processamento em background...`);
      this.processGuestAnalysisInBackground(phoneNumber, jogoDesejado);
    } else {
      this.logger.log(`❌ Índice inválido (${index}), enviando boas-vindas`);
      await this.sendGuestWelcomeMessage(phoneNumber);
    }
  }

  private async processGuestAnalysisInBackground(
    phoneNumber: string,
    jogoDesejado: any,
  ) {
    try {
      this.logger.log('🔄 ===== INICIANDO PROCESSAMENTO EM BACKGROUND =====');
      this.logger.log('🔄 Starting background analysis processing...');
      
      this.logger.log(`📡 Chamando API Aurora para análise...`);
      const analisy = await this.getGuestQuestion(jogoDesejado);
      this.logger.log(`📊 Analysis result: ${analisy.message ? 'SUCCESS' : 'NULL'}`);

      if (analisy.message === null) {
        this.logger.log('❌ Analysis message is null, sending error message');
        await this.twilioService.sendTextWhatsAppMessage(
          'Desculpe, não consegui encontrar a análise desejada.',
          phoneNumber,
        );
        this.logger.log(`✅ Mensagem de erro enviada`);
        return;
      }

      this.logger.log(`📏 Analysis message length: ${analisy.message.length}`);

      // Envia a análise
      if (analisy.message.length > 1599) {
        this.logger.log('📝 Message too long, truncating...');
        const textSplited = analisy.message.slice(0, 1599 - 3) + '...';
        await this.twilioService.sendTextWhatsAppMessage(
          textSplited,
          phoneNumber,
        );
        this.logger.log(`✅ Análise truncada enviada (${textSplited.length} caracteres)`);
      } else {
        // Log da análise gratuita antes de enviar
        this.logger.log('🎯 ===== ANÁLISE GRATUITA ENVIADA =====');
        this.logger.log(analisy.message);
        this.logger.log('🎯 ===== FIM DA ANÁLISE GRATUITA =====');
        
        await this.twilioService.sendTextWhatsAppMessage(
          analisy.message,
          phoneNumber,
        );
        this.logger.log(`✅ Análise completa enviada (${analisy.message.length} caracteres)`);
      }

      // CRIA USUÁRIO NA TABELA PRE_USERS após análise
      this.logger.log(`💾 Criando registro na tabela pre_users...`);
      try {
        await this.preUsersService.create(phoneNumber);
        this.logger.log(`✅ Created pre-user record for ${phoneNumber}`);
      } catch (error) {
        this.logger.error(`❌ Error creating pre-user record: ${error.message}`);
      }

      // Envia mensagem de cadastro após a análise
      this.logger.log(`📤 Enviando mensagem de cadastro...`);
      await this.sendSignUpMessage(phoneNumber);
      this.logger.log(`✅ Mensagem de cadastro enviada`);
      this.logger.log('🏁 ===== PROCESSAMENTO EM BACKGROUND FINALIZADO =====');
    } catch (error) {
      this.logger.error(`❌ Error processing guest analysis: ${error.message}`);
      await this.twilioService.sendTextWhatsAppMessage(
        '⏰ A análise está demorando mais do que o esperado. Tente novamente em alguns minutos ou escolha outro jogo.',
        phoneNumber,
      );
      this.logger.log(`✅ Mensagem de timeout enviada`);
    }
  }

  private async getGuestQuestion(jogodesejado: {
    dataHora: string;
    titulo: string;
  }): Promise<{
    message: string | null;
  }> {
    this.logger.log(
      `🔍 ===== INICIANDO BUSCA DE ANÁLISE =====`,
    );
    this.logger.log(
      `📋 Getting guest question for game: ${JSON.stringify(jogodesejado)}`,
    );

    const currentYear = new Date().getFullYear();
    const data = jogodesejado.dataHora;
    const gameTitle = `${jogodesejado.titulo} - ${data}/${currentYear}`;
    
    this.logger.log(`🎮 Game title: ${gameTitle}`);

    // Verifica se já existe no cache
    this.logger.log(`🔍 Verificando cache para: "${gameTitle}"`);
    const questionCache: QuestionCacheEntity =
      await this.questionCacheService.findAllByQuestionAndRefSource(
        gameTitle,
        'whatsapp',
      );

    if (questionCache) {
      this.logger.log(`✅ Found cached question for guest user`);
      this.logger.log(`📏 Cached answer length: ${questionCache.answer.length} caracteres`);
      return {
        message: questionCache.answer,
      };
    } else {
      this.logger.log(`❌ Cache não encontrado, chamando API Aurora...`);
      const match = jogodesejado.titulo.split(' vs ');
      if (!match || match.length === 0) {
        this.logger.error(`❌ Formato inválido para jogo: ${jogodesejado.titulo}`);
        throw new Error('Formato inválido');
      }
      const homeTeam = match[0].trim();
      const awayTeam = match[1].trim();

      this.logger.log(`🏠 Home team: ${homeTeam}`);
      this.logger.log(`✈️ Away team: ${awayTeam}`);
      this.logger.log(`📅 Date: ${data}/${currentYear}`);

      this.logger.log(`📡 Chamando Aurora API...`);
      const result = await this.auroraService.handleAnalisy(
        homeTeam,
        awayTeam,
        gameTitle,
        'user_2spLEwqKoxAcREP07GcGDrRoour',
        `${data}/${currentYear}`,
        'whatsapp',
      );

      this.logger.log(`📊 Aurora response received: ${result ? result.length : 0} caracteres`);

      if (result && !result.startsWith('ERRO')) {
        // Verifica se a resposta não contém erros conhecidos
        if (!result.includes('401: Usuário não encontrado') && 
            !result.includes('Opa, identificamos um erro na sua resposta') &&
            !result.includes('Fique tranquilo')) {
          this.logger.log(`✅ Resposta válida, salvando no cache...`);
          // Salva no cache para futuras consultas
          await this.questionCacheService.create({
            question: gameTitle,
            answer: result,
            refSource: 'whatsapp',
            userId: null, // Guest user
            gameTime: data,
            createdAt: new Date(),
          });
          this.logger.log(`✅ Análise salva no cache`);
        } else {
          this.logger.log(`⚠️ Resposta contém erro conhecido, não salvando no cache`);
        }

        return {
          message: result,
        };
      } else {
        this.logger.log(`❌ Aurora retornou erro ou resposta inválida`);
        return {
          message: null,
        };
      }
    }
  }

  private async sendGuestWelcomeMessage(phoneNumber: string) {
    this.logger.log(`👋 ===== ENVIANDO MENSAGEM DE BOAS-VINDAS =====`);
    
    const message = `⚽ Olá! Bem-vindo ao StatsPro AI! 📊

🎁 *ANÁLISE GRATUITA DISPONÍVEL*
Você pode fazer uma análise gratuita de qualquer jogo antes de se cadastrar!

Para começar, digite: *analise*

Depois da análise, você poderá se cadastrar e ganhar 10 análises gratuitas! 🚀

👉 Cadastre-se: https://statspro.ai/sign-up`;

    // Log da mensagem de boas-vindas
    this.logger.log('👋 ===== MENSAGEM DE BOAS-VINDAS =====');
    this.logger.log(message);
    this.logger.log('👋 ===== FIM DA MENSAGEM =====');

    await this.twilioService.sendTextWhatsAppMessage(message, phoneNumber);
    this.logger.log(`✅ Mensagem de boas-vindas enviada para ${phoneNumber}`);
  }

  private async sendSignUpMessage(phoneNumber: string) {
    this.logger.log(`🎉 ===== ENVIANDO MENSAGEM DE CADASTRO =====`);
    
    const message = `🎉 *Análise concluída!*

Gostou da análise? Agora é hora de se cadastrar e ganhar 10 análises gratuitas!

🚀 *Benefícios do cadastro:*
• 10 análises gratuitas
• Acesso a todas as ligas
• Análises em tempo real
• Suporte especializado

👉 *Cadastre-se agora:* https://statspro.ai/sign-up

Para fazer mais análises, digite: *analise*`;

    // Log da mensagem de cadastro
    this.logger.log('🎉 ===== MENSAGEM DE CADASTRO =====');
    this.logger.log(message);
    this.logger.log('🎉 ===== FIM DA MENSAGEM =====');

    await this.twilioService.sendTextWhatsAppMessage(message, phoneNumber);
    this.logger.log(`✅ Mensagem de cadastro enviada para ${phoneNumber}`);
  }
}
