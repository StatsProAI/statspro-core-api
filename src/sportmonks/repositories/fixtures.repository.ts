import { Injectable, Logger } from '@nestjs/common';
import { SportMonksApiClient } from '../clients/sportmonks-api.client';
import { ApiFixture } from '../types/api-response.types';
import { Fixture } from '../dto/fixture.dto';

@Injectable()
export class FixturesRepository {
  private readonly logger = new Logger(FixturesRepository.name);

  constructor(private readonly apiClient: SportMonksApiClient) {}

  /**
   * Busca fixtures por data
   * @param date Data no formato YYYY-MM-DD
   * @returns Lista de fixtures
   */
  async findByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Finding fixtures for date: ${date}`);

    try {
      const response = await this.apiClient.getFixturesByDate(date);

      const fixtures = response.data.map((fixture) =>
        this.mapToSimpleFixture(fixture),
      );

      this.logger.log(`Found ${fixtures.length} fixtures for date: ${date}`);
      return fixtures;
    } catch (error) {
      this.logger.error(
        `Failed to find fixtures: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Busca fixtures por IDs
   * @param ids Lista de IDs de fixtures
   * @param includes Dados adicionais a serem incluídos
   * @returns Lista de fixtures
   */
  async findByIds(ids: number[], includes: string[] = []): Promise<Fixture[]> {
    this.logger.log(`Finding fixtures with IDs: ${ids.join(', ')}`);

    try {
      const response = await this.apiClient.getFixturesByIds(ids, includes);

      const fixtures = response.data.map((fixture) =>
        this.mapToDetailedFixture(fixture),
      );

      this.logger.log(`Found ${fixtures.length} fixtures by IDs`);
      return fixtures;
    } catch (error) {
      this.logger.error(
        `Failed to find fixtures by IDs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Mapeia uma fixture da API para um objeto simplificado
   */
  private mapToSimpleFixture(apiFixture: ApiFixture): Fixture {
    if (!apiFixture) {
      this.logger.warn('Received undefined fixture from API');
      return null;
    }

    return {
      id: apiFixture.id,
      league: apiFixture.league
        ? {
            id: apiFixture.league.id,
            name: apiFixture.league.name,
            country_id: apiFixture.league.country_id,
            image_path: apiFixture.league.image_path,
          }
        : null,
    };
  }

  /**
   * Mapeia uma fixture da API para um objeto detalhado
   */
  private mapToDetailedFixture(apiFixture: ApiFixture): Fixture {
    if (!apiFixture) {
      this.logger.warn('Received undefined fixture from API');
      return null;
    }

    const fixture: Fixture = {
      id: apiFixture.id,
      sport_id: apiFixture.sport_id,
      league_id: apiFixture.league_id,
      season_id: apiFixture.season_id,
      stage_id: apiFixture.stage_id,
      group_id: apiFixture.group_id,
      aggregate_id: apiFixture.aggregate_id,
      round_id: apiFixture.round_id,
      state_id: apiFixture.state_id,
      venue_id: apiFixture.venue_id,
      name: apiFixture.name,
      starting_at: apiFixture.starting_at,
      result_info: apiFixture.result_info,
      leg: apiFixture.leg,
      details: apiFixture.details,
      length: apiFixture.length,
      placeholder: apiFixture.placeholder,
      has_odds: apiFixture.has_odds,
      has_premium_odds: apiFixture.has_premium_odds,
      starting_at_timestamp: apiFixture.starting_at_timestamp,
      participants: apiFixture.participants,
      statistics: apiFixture.statistics,
      timeline: apiFixture.timeline,
      events: apiFixture.events,
      lineups: apiFixture.lineups,
      tvStations: apiFixture.tvStations,
      scores: apiFixture.scores,
      formations: apiFixture.formations,
    };

    if (apiFixture.league) {
      fixture.league = {
        id: apiFixture.league.id,
        name: apiFixture.league.name,
        country_id: apiFixture.league.country_id,
        image_path: apiFixture.league.image_path,
      };
    }

    return fixture;
  }
}
