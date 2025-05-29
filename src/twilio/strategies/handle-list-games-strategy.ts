import { Injectable, Logger } from '@nestjs/common';
import { SportMonksService } from '../../sportmonks/sportmonks.service';
import { addDays, format, subHours } from 'date-fns';
import { Fixture } from '../../sportmonks/fixture.dto';
import { TwilioService } from '../twilio.service';

@Injectable()
export class HandleListGamesStrategy {
  private readonly logger = new Logger(HandleListGamesStrategy.name);

  constructor(
    private readonly sportMonksService: SportMonksService,
    private readonly twilioService: TwilioService,
  ) {}

  async execute(userId: string, from: string) {
    this.logger.log(
      `Starting list games execution for user ${userId} from ${from}`,
    );
    const message = await this.builderGamesMessage();
    this.logger.log(`Sending WhatsApp message to ${from}`);
    await this.twilioService.sendWhatsAppMessageListGames(message, from);
    this.logger.log('Message sent successfully');
  }

  async builderGamesMessage() {
    this.logger.log('Building games message');
    const jogosDesejados: any[] = await this.getGames();
    this.logger.log(`Found ${jogosDesejados.length} games to display`);
    // Primeiro, agrupar os jogos por liga
    const jogosPorLiga = jogosDesejados.reduce(
      (acc, jogo) => {
        const leagueName = jogo.league?.name || 'Unknown';
        if (!acc[leagueName]) {
          acc[leagueName] = [];
        }
        acc[leagueName].push(jogo);
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any[]>,
    );

    this.logger.log(
      `Games grouped into ${Object.keys(jogosPorLiga).length} leagues`,
    );

    // Agora, montar a mensagem agrupada
    let mensagem = '';
    let indexGlobal = 1;

    for (const [leagueName, jogos] of Object.entries(jogosPorLiga)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jogosArray = jogos as any[]; // <<< aqui você resolve o 'unknown'

      mensagem += `🏆 *${leagueName}*\n`;
      jogosArray.forEach((jogo) => {
        const originalDate = new Date(jogo.starting_at);
        const dateWithMinus3 = subHours(originalDate, 3);

        const dateFormatted = dateWithMinus3.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });
        mensagem += `*${indexGlobal}.* ${jogo.name} - ${dateFormatted}\n`;
        indexGlobal++;
      });
      mensagem += '\n'; // espaço entre as ligas
    }

    this.logger.log(
      `Message built successfully with length: ${mensagem.length}`,
    );
    return mensagem;
  }

  async getGames() {
    this.logger.log('Fetching games from SportMonks');
    const desiredLeagueIds = [648, 8, 564, 1122, 1116, 2];
    const allGames: any[] = [];
    let index = 1;

    const daysToReadListGames =
      Number(process.env.SPORTMONKS_DAYS_LIST_GAMES) || 6;

    for (let i = 0; i < daysToReadListGames; i++) {
      const date = addDays(new Date(), i); // adiciona i dias a partir de hoje
      const dateStr = format(date, 'yyyy-MM-dd'); // converte para string no formato certo
      this.logger.log(`Fetching fixtures for date: ${dateStr}`);

      const fixtures: Fixture[] =
        await this.sportMonksService.getAllFixturesByDate(dateStr);
      this.logger.log(
        `Found ${fixtures?.length || 0} total fixtures for ${dateStr}`,
      );

      const currentTimestamp = Math.floor(Date.now() / 1000); // Convert current time to seconds
      const THREE_HOURS_IN_SECONDS = 3 * 60 * 60; // 3 hours in seconds

      const desiredGames =
        fixtures?.filter(
          (game) =>
            desiredLeagueIds.includes(game.league.id) &&
            game.starting_at_timestamp >
              currentTimestamp,
        ) || [];
      this.logger.log(
        `Filtered to ${desiredGames.length} desired games for ${dateStr}`,
      );

      for (const game of desiredGames) {
        if (allGames.length >= 32) break;
        // Stop adding games if we reach 32
        allGames.push({
          ...game,
          index: index++,
        });
      }

      if (allGames.length >= 32) break; // Stop the loop if we already have 32 games
    }

    this.logger.log(`Total games collected: ${allGames.length}`);
    return allGames;
  }
}
