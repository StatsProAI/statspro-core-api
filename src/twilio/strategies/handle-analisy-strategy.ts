import { Injectable, Logger } from '@nestjs/common';
import { TwilioService } from '../twilio.service';
import { twilioExtractGameText } from '../../common/utils/twilio-extract-game-text';
import { HandleDefaultStrategy } from './handle-default-strategy';
import { UsersService } from '../../users/users.service';
import { QuestionCacheService } from '../../question-cache/question-cache.service';
import { QuestionService } from '../../question/question.service';
import { QuestionCacheEntity } from '../../bigquery/entities/QuestionCacheEntity';
import { WhatsappTwilioSessionService } from '../../whatsapp-twilio-session/whatsapp-twilio-session.service';
import { AuroraService } from '../../aurora/aurora.service';
import {
  AURORA_ERRORS,
  auroraCheckStartsWith,
} from '../../common/utils/aurora-check-starts-with';

@Injectable()
export class HandleAnalisyStrategy {
  private readonly logger = new Logger(HandleAnalisyStrategy.name);

  constructor(
    private readonly twilioService: TwilioService,
    private readonly handleDefaultStrategy: HandleDefaultStrategy,
    private readonly usersService: UsersService,
    private readonly questionCacheService: QuestionCacheService,
    private readonly questionService: QuestionService,
    private readonly whatsappTwilioSessionService: WhatsappTwilioSessionService,
    private readonly auroraService: AuroraService,
  ) {
    this.logger.log('HandleAnalisyStrategy initialized');
  }

  async execute(userId: string, from: string, text: string) {
    this.logger.debug(
      `Executing analysis strategy for user ${userId} from ${from}`,
    );

    const lastMessage = await this.twilioService.getLastMessage(from);
    this.logger.debug(`Last message retrieved`);

    const jogosDesejado = twilioExtractGameText(lastMessage?.body);
    const index = Number(text) - 1;

    this.logger.debug(
      `Selected game index: ${index}, Total games available: ${jogosDesejado.length}`,
    );

    if (index >= 0 && index < jogosDesejado.length) {
      const jogoDesejado = jogosDesejado[index];
      this.logger.debug(
        `Processing analysis for game: ${JSON.stringify(jogoDesejado)}`,
      );

      const analisy: {
        discontCredits: boolean;
        message: string | null;
        userId?: string;
      } = await this.getQuestion(jogoDesejado, userId);

      if (analisy.message === null) {
        this.logger.warn(
          `No analysis found for game: ${JSON.stringify(jogoDesejado)}`,
        );
        await this.twilioService.sendTextWhatsAppMessage(
          'Desculpe, não consegui encontrar a análise desejada.',
          from,
        );
        return;
      }

      if (analisy.message === 'zerocredits') {
        await this.twilioService.sendMessageWithTemplate({
          phoneNumber: from,
          contentSid: 'HX928beb51dc4f294c11f9303afc53393b'
        });
      } else if (analisy.message.length > 1599) {
        this.logger.debug(
          `Message length exceeds limit (${analisy.message.length} chars), truncating...`,
        );
        const textSplited = analisy.message.slice(0, 1599 - 3) + '...';
        await this.twilioService.sendTextWhatsAppMessage(textSplited, from);
      } else {
        await this.twilioService.sendTextWhatsAppMessage(analisy.message, from);
      }

      this.logger.debug(
        `Updating session status to ANALYSIS for user ${userId}`,
      );
      await this.whatsappTwilioSessionService.updateSession(userId, {
        status: 'ANALYSIS',
      });
      if (analisy.discontCredits) {
        await this.usersService.updateCredits(userId, 2);
      }
    } else {
      this.logger.warn(
        `Invalid game index ${index} selected, falling back to default strategy`,
      );
      this.handleDefaultStrategy.execute(userId, from);
    }
  }

  async getQuestion(
    jogodesejado: {
      dataHora: string;
      titulo: string;
    },
    userId: string,
  ): Promise<{
    discontCredits: boolean;
    message: string | null;
    userId?: string;
  }> {
    this.logger.debug(
      `Getting question for user ${userId} and game: ${JSON.stringify(jogodesejado)}`,
    );

    const user = await this.usersService.findUserById(userId);
    if (!user) {
      this.logger.error(`User not found with ID: ${userId}`);
      throw new Error('Usuário não encontrado');
    }

    if (user.credits < 2) {
      this.logger.warn(
        `Insufficient credits for user ${userId}. Current credits: ${user.credits}`,
      );
      const msg = `zerocredits`;
      return {
        discontCredits: false,
        message: msg,
      };
    }

    const currentYear = new Date().getFullYear();
    const data = jogodesejado.dataHora;
    const gameTitle = `${jogodesejado.titulo} - ${data}/${currentYear}`;
    this.logger.debug(`Searching for question with title: ${gameTitle}`);

    let questionCache: QuestionCacheEntity =
      await this.questionCacheService.findAllByQuestionAndRefSource(
        `${jogodesejado.titulo} - ${data}/${currentYear}`,
        'whatsapp',
      );

    if (questionCache) {
      this.logger.debug(`Found cached question for game: ${gameTitle}`);
      await this.questionService.create({
        userId: user.userId!,
        answer: questionCache.answer!,
        question: gameTitle,
        type: 'analysis',
        matchDate: data,
        refSource: 'whatsapp',
      });

      return {
        discontCredits: true,
        message: questionCache.answer,
        userId: user.userId!,
      };
    } else {
      const match = jogodesejado.titulo.split(' vs ');
      if (!match || match.length === 0) {
        throw new Error('Formato inválido');
      }
      const homeTeam = match[0].trim();
      const awayTeam = match[1].trim();

      let result = await this.auroraService.handleAnalisy(
        homeTeam,
        awayTeam,
        gameTitle,
        user.userId,
        `${data}/${currentYear}`,
        'whatsapp',
      );

      const hasError = auroraCheckStartsWith(result!, AURORA_ERRORS);

      if (!hasError) {
        await this.questionService.create({
          userId: user.userId!,
          answer: result!,
          question: gameTitle,
          type: 'analysis',
          matchDate: data,
          refSource: 'whatsapp',
        });

        await this.questionCacheService.create({
          question: gameTitle,
          answer: result!,
          refSource: 'whatsapp',
          userId: user.userId!,
          gameTime: data,
        });
        return {
          discontCredits: true,
          message: result
        }
      } else {
        return {
          discontCredits: false,
          message: null,
        };
      }
    }
  }
}
