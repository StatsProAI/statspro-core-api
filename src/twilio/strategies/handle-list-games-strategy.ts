import { Injectable } from '@nestjs/common';
import { SportMonksService } from '../../sportmonks/sportmonks.service';
import { addDays, format } from 'date-fns';
import { Fixture } from '../../sportmonks/fixture.dto';
import { TwilioService } from '../twilio.service';

@Injectable()
export class HandleListGamesStrategy {
  constructor(
    private readonly sportMonksService: SportMonksService,
    private readonly twilioService: TwilioService,
  ) {}

  async execute(userId: string, from: string) {
    const message = await this.builderGamesMessage();
    await this.twilioService.sendWhatsAppMessageListGames(message, from);
  }

  async builderGamesMessage() {
    const jogosDesejados: any[] = await this.getGames();

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

    // Agora, montar a mensagem agrupada
    let mensagem = '';
    let indexGlobal = 1;

    for (const [leagueName, jogos] of Object.entries(jogosPorLiga)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jogosArray = jogos as any[]; // <<< aqui você resolve o 'unknown'

      mensagem += `🏆 *${leagueName}*\n`;
      jogosArray.forEach((jogo) => {
        const dateFormatted = new Date(jogo.starting_at).toLocaleDateString(
          'pt-BR',
          {
            day: '2-digit',
            month: '2-digit',
          },
        );
        mensagem += `*${indexGlobal}.* ${jogo.name} - ${dateFormatted}\n`;
        indexGlobal++;
      });
      mensagem += '\n'; // espaço entre as ligas
    }

    console.log('Lista de jogos construída: ', mensagem.length);

    return mensagem;
  }

  async getGames() {
    const desiredLeagueIds = [648, 8, 564];
    const allGames: any[] = [];
    let index = 1;

    for (let i = 0; i < 3; i++) {
      const date = addDays(new Date(), i); // adiciona i dias a partir de hoje
      const dateStr = format(date, 'yyyy-MM-dd'); // converte para string no formato certo
      const fixtures: Fixture[] =
        await this.sportMonksService.getFixturesByDate(dateStr);

      const desiredGames =
        fixtures?.filter((game) => desiredLeagueIds.includes(game.league.id)) ||
        [];

      for (const game of desiredGames) {
        allGames.push({
          ...game,
          index: index++,
        });
      }
    }

    return allGames;
  }
}
