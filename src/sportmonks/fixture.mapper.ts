import { Logger } from '@nestjs/common';
import { ApiFixture } from './api-response.types';
import { Fixture } from './fixture.dto';

/**
 * Mapeia fixtures da API SportMonks para o formato interno da aplicação
 */
export class FixtureMapper {
  private static readonly logger = new Logger(FixtureMapper.name);

  /**
   * Mapeia uma fixture da API para um objeto simplificado
   */
  static mapToSimpleFixture(apiFixture: ApiFixture): Fixture {
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
  static mapToDetailedFixture(apiFixture: ApiFixture): Fixture {
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