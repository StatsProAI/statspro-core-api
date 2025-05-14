import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiFixtureResponse, ApiFixture } from '../types/api-response.types';
import { SportMonksConfig } from '../config/sportmonks.config';
import { Fixture } from '../dto/fixture.dto';

@Injectable()
export class SportMonksApiRepository {
  private readonly logger = new Logger(SportMonksApiRepository.name);
  private readonly httpClient: AxiosInstance;

  constructor(private readonly config: SportMonksConfig) {
    if (!this.config.apiToken) {
      this.logger.warn('SPORTMONKS_API_TOKEN not defined in environment variables!');
    }

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
    });
  }

  /**
   * Executa uma chamada GET para a API SportMonks
   * @param endpoint Endpoint a ser chamado
   * @param params Parâmetros adicionais para a requisição
   * @returns Resposta da API
   */
  private async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params: {
          api_token: this.config.apiToken,
          ...params,
        },
      };

      this.logger.debug(`Making API request to ${endpoint}`);
      const response = await this.httpClient.get<T>(endpoint, config);
      return response.data;
    } catch (error) {
      this.logger.error(
        `API call failed: ${error.message}`, 
        error.response?.data ? JSON.stringify(error.response.data) : error.stack
      );
      throw error;
    }
  }

  /**
   * Padroniza a resposta da API para um formato consistente
   */
  private normalizeResponse<T>(data: any): ApiFixtureResponse {
    const normalizedData = Array.isArray(data) 
      ? data 
      : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) 
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
   * Busca fixtures por data
   * @param date Data no formato YYYY-MM-DD
   * @returns Lista de fixtures
   */
  async findByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Finding fixtures for date: ${date}`);
    
    try {
      const response = await this.getFixturesByDate(date);
      
      const fixtures = response.data.map(fixture => this.mapToSimpleFixture(fixture));
      
      this.logger.log(`Found ${fixtures.length} fixtures for date: ${date}`);
      return fixtures;
    } catch (error) {
      this.logger.error(`Failed to find fixtures: ${error.message}`, error.stack);
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
      const response = await this.getFixturesByIds(ids, includes);
      
      const fixtures = response.data.map(fixture => this.mapToDetailedFixture(fixture));
      
      this.logger.log(`Found ${fixtures.length} fixtures by IDs`);
      return fixtures;
    } catch (error) {
      this.logger.error(`Failed to find fixtures by IDs: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Busca fixtures por data, lidando com paginação automaticamente
   * @param date Data no formato YYYY-MM-DD
   * @param includes Dados adicionais a serem incluídos
   * @returns Todas as fixtures da data especificada
   */
  private async getFixturesByDate(date: string, includes: string = 'league'): Promise<ApiFixtureResponse> {
    const endpoint = `/football/fixtures/date/${date}`;
    let currentPage = 1;
    let hasMore = true;
    let allData = [];

    while (hasMore) {
      const response = await this.get<ApiFixtureResponse>(endpoint, {
        include: includes,
        page: currentPage,
      });

      allData = [...allData, ...response.data];
      hasMore = response.pagination.has_more;
      currentPage++;

      this.logger.debug(
        `Fetched page ${response.pagination.current_page} of fixtures. Total fixtures so far: ${allData.length}`,
      );
    }

    return this.normalizeResponse(allData);
  }

  /**
   * Busca múltiplos fixtures por IDs
   * @param fixtureIds Array de IDs dos fixtures a serem buscados
   * @param includes Dados adicionais a serem incluídos
   * @returns Fixtures correspondentes aos IDs
   */
  private async getFixturesByIds(
    fixtureIds: number[], 
    includes: string[] = []
  ): Promise<ApiFixtureResponse> {
    this.logger.log(`Fetching fixtures with IDs: ${fixtureIds.join(',')}`);
    
    const endpoint = `/football/fixtures/multi/${fixtureIds.join(',')}`;
    const includesParam = includes.length ? includes.join(';') : '';
    
    try {
      const response = await this.get<any>(endpoint, {
        include: includesParam,
      });
      
      this.logger.log(`Successfully fetched fixtures by IDs`);
      return this.normalizeResponse(response);
    } catch (error) {
      this.logger.error(`Failed to fetch fixtures by IDs: ${error.message}`, error.stack);
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
        : null
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
      formations: apiFixture.formations
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