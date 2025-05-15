import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../common/http/http.service';
import { Fixture } from './fixture.dto';
import { ApiFixtureResponse } from './api-response.types';
import { FixtureMapper } from './fixture.mapper';

@Injectable()
export class SportMonksService {
  private readonly logger = new Logger(SportMonksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');

    if (!apiToken) {
      this.logger.warn(
        'SPORTMONKS_API_TOKEN not defined in environment variables!',
      );
    }

    const baseURL = this.configService.get<string>(
      'SPORTMONKS_BASE_URL',
      'https://api.sportmonks.com/v3',
    );
    const timeout = this.configService.get<number>('SPORTMONKS_TIMEOUT', 10000);

    // Configura o httpService
    this.httpService.configure(baseURL, timeout);
  }

  /**
   * Padroniza a resposta da API para um formato consistente
   */
  private normalizeResponse(data: any): ApiFixtureResponse {
    const normalizedData = Array.isArray(data)
      ? data
      : data &&
          typeof data === 'object' &&
          'data' in data &&
          Array.isArray(data.data)
        ? data.data
        : [data];

    return {
      data: normalizedData,
      pagination: {
        count: normalizedData.length,
        per_page: normalizedData.length,
        current_page: 1,
        next_page: null,
        has_more: false,
      },
    };
  }

  /**
   * Busca fixtures por data, lidando com paginação automaticamente
   */
  private async getFixturesByDateFromApi(
    date: string,
    includes: string = 'league',
  ): Promise<ApiFixtureResponse> {
    const endpoint = `/football/fixtures/date/${date}`;
    let currentPage = 1;
    let hasMore = true;
    let allData = [];

    while (hasMore) {
      const response = await this.httpService.get<ApiFixtureResponse>(
        endpoint,
        {
          include: includes,
          page: currentPage,
          api_token: this.configService.get<string>('SPORTMONKS_API_TOKEN'),
        },
      );

      allData = [...allData, ...response.data];
      hasMore = response.pagination.has_more;
      currentPage++;

      this.logger.debug(
        `Fetched page ${response.pagination.current_page} of fixtures. Total fixtures so far: ${allData.length}`,
      );
    }

    return FixtureMapper.normalizeResponse(allData);
  }

  /**
   * Busca múltiplos fixtures por IDs diretamente da API
   */
  private async getFixturesByIdsFromApi(
    fixtureIds: number[],
    includes: string[] = [],
  ): Promise<ApiFixtureResponse> {
    this.logger.log(`Fetching fixtures with IDs: ${fixtureIds.join(',')}`);

    const endpoint = `/football/fixtures/multi/${fixtureIds.join(',')}`;
    const includesParam = includes.length ? includes.join(';') : '';

    try {
      const response = await this.httpService.get<any>(endpoint, {
        include: includesParam,
        api_token: this.configService.get<string>('SPORTMONKS_API_TOKEN'),
      });

      this.logger.log(`Successfully fetched fixtures by IDs`);
      return FixtureMapper.normalizeResponse(response);
    } catch (error) {
      this.logger.error(
        `Failed to fetch fixtures by IDs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures for date: ${date}`);

    try {
      const response = await this.getFixturesByDateFromApi(date);

      const fixtures = response.data.map((fixture) =>
        FixtureMapper.mapToSimpleFixture(fixture),
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

  async getFixturesByIds(ids: string, includes?: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures by IDs: ${ids}`);

    const fixtureIds = ids.split(',').map((id) => parseInt(id.trim(), 10));

    const includesArray = includes ? includes.split(';') : [];

    try {
      const response = await this.getFixturesByIdsFromApi(
        fixtureIds,
        includesArray,
      );

      const fixtures = response.data.map((fixture) =>
        FixtureMapper.mapToDetailedFixture(fixture),
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
}
