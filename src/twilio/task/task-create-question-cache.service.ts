import { Injectable } from '@nestjs/common';
import { HandleListGamesStrategy } from '../strategies/handle-list-games-strategy';
import { Cron } from '@nestjs/schedule';
import { subHours } from 'date-fns';
import { QuestionCacheService } from '../../question-cache/question-cache.service';
import { AuroraService } from '../../aurora/aurora.service';
import {
  AURORA_ERRORS,
  auroraCheckStartsWith,
} from '../../common/utils/aurora-check-starts-with';
import { RefSource } from 'src/mongo/enum/ref-source.enum';

@Injectable()
export class TaskCreateQuestionCacheService {
  constructor(
    private readonly handleListGamesStrategy: HandleListGamesStrategy,
    private readonly questionCacheService: QuestionCacheService,
    private readonly auroraService: AuroraService,
  ) {}

  @Cron('0 22 1 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleCron1() {
    await this.processTask();
  }

  @Cron('0 22 2 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleCron2() {
    await this.processTask();
  }

  @Cron('0 22 3 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleCron3() {
    await this.processTask();
  }

  @Cron('0 22 4 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleCro4() {
    await this.processTask();
  }

  @Cron('0 22 5 * * *', { timeZone: 'America/Sao_Paulo' })
  async handleCron5() {
    await this.processTask();
  }

  async processTask() {
    console.log(
      '🚀 Iniciando processamento de jogos...',
      new Date().toISOString(),
    );
    const stats = {
      totalProcessed: 0,
      savedToCache: 0,
      alreadyInCache: 0,
      errors: 0,
    };

    const games = await this.handleListGamesStrategy.getGames();
    for await (const game of games) {
      stats.totalProcessed++;

      const originalDate = new Date(game.starting_at);
      const dateWithMinus3 = subHours(originalDate, 3);

      const dateFormatted = dateWithMinus3.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });

      const currentYear = new Date().getFullYear();
      const gameIdentifier = `${game.name} - ${dateFormatted}/${currentYear}`;

      console.log(
        `\n📊 Processando jogo ${stats.totalProcessed}: ${game.name}`,
      );
      console.log(`📅 Data do jogo: ${dateFormatted}/${currentYear}`);

      const questionCache =
        await this.questionCacheService.findAllByQuestionAndRefSource(
          gameIdentifier,
          'whatsapp',
        );

      if (questionCache) {
        console.log(`✅ Jogo já existe no cache: ${game.name}`);
        stats.alreadyInCache++;
      } else {
        console.log(`🆕 Jogo não encontrado no cache, iniciando análise...`);
        const match = game.name.split(' vs ');
        if (!match || match.length === 0) {
          console.error(`❌ Formato inválido para o jogo: ${game.name}`);
          stats.errors++;
          continue;
        }
        const homeTeam = match[0].trim();
        const awayTeam = match[1].trim();

        console.log(`📡 Consultando API Aurora para análise...`);
        try {
          let result = await this.auroraService.handleAnalisy(
            homeTeam,
            awayTeam,
            gameIdentifier,
            'user_2spLEwqKoxAcREP07GcGDrRoour',
            `${dateFormatted}/${currentYear}`,
            'whatsapp',
          );
          const hasError = auroraCheckStartsWith(result!, AURORA_ERRORS);
          if (!hasError) {
            console.log(`💾 Salvando análise no banco de dados...`);
            await this.questionCacheService.create({
              question: gameIdentifier,
              answer: result!,
              created_at: new Date(),
              ref_source: RefSource.whatsapp,
              userId: 'user_2spLEwqKoxAcREP07GcGDrRoour',
              game_time: `${dateFormatted}/${currentYear}`,
            });
            console.log(`✅ Análise salva com sucesso!`);
            stats.savedToCache++;
          } else {
            console.error(`❌ Erro ao processar jogo ${game.name}: ${result}`);
            stats.errors++;
          }
        } catch (error) {
          console.error(
            `❌ Erro na chamada da API Aurora para o jogo ${game.name}:`,
            error,
          );
          stats.errors++;
        }
      }
    }
    console.log('\n📈 RESUMO DO PROCESSAMENTO:');
    console.log(`Total de jogos processados: ${stats.totalProcessed}`);
    console.log(`Jogos já existentes no cache: ${stats.alreadyInCache}`);
    console.log(`Novos jogos salvos no cache: ${stats.savedToCache}`);
    console.log(`Erros encontrados: ${stats.errors}`);
    console.log('✨ Processamento finalizado!\n');
  }
}
