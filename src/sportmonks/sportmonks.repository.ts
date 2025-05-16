import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '../common/http/http.service';
import { SportMonksConfig } from './sportmonks.config';
import { ApiFixtureResponse } from './api-response.types';
import { FixtureMapper } from './fixture.mapper';

@Injectable()
export class SportMonksRepository {
  private readonly logger = new Logger(SportMonksRepository.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: SportMonksConfig,
  ) {
    this.httpService.configure(this.config.baseUrl, this.config.timeout);
  }

  /**
   * Busca fixtures por data, lidando com paginação automaticamente
   */
  async getFixturesByDate(
    date: string,
    includes: string = 'league',
  ): Promise<ApiFixtureResponse> {
    const endpoint = `/football/fixtures/date/${date}`;
    let currentPage = 1;
    let hasMore = true;
    let allData = [];

    try {
      while (hasMore) {
        const response = await this.httpService.get<ApiFixtureResponse>(
          endpoint,
          {
            include: includes,
            page: currentPage,
            api_token: this.config.apiToken,
          },
        );

        allData = [...allData, ...response.data];
        hasMore = response.pagination.has_more;
        currentPage++;

        this.logger.debug(
          `Fetched page ${response.pagination.current_page} of fixtures. Total fixtures so far: ${allData.length}`,
        );
      }

      this.logger.log(`Successfully fetched fixtures for date: ${date}`);
      return FixtureMapper.normalizeResponse(allData);
    } catch (error) {
      this.logger.error(
        `Failed to fetch fixtures by date ${date}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Busca múltiplos fixtures por IDs diretamente da API
   */
  async getFixturesByIds(
    fixtureIds: number[],
    includes: string[] = [],
  ): Promise<ApiFixtureResponse> {
    this.logger.log(`Fetching fixtures with IDs: ${fixtureIds.join(',')}`);

    const endpoint = `/football/fixtures/multi/${fixtureIds.join(',')}`;
    const includesParam = includes.length ? includes.join(';') : '';

    try {
      const response = await this.httpService.get<any>(endpoint, {
        include: includesParam,
        api_token: this.config.apiToken,
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
}