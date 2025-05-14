import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiFixtureResponse } from '../types/api-response.types';
import { SportMonksConfig } from '../config/sportmonks.config';

@Injectable()
export class SportMonksApiClient {
  private readonly logger = new Logger(SportMonksApiClient.name);
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
   * Busca fixtures por data, lidando com paginação automaticamente
   * @param date Data no formato YYYY-MM-DD
   * @param includes Dados adicionais a serem incluídos
   * @returns Todas as fixtures da data especificada
   */
  async getFixturesByDate(date: string, includes: string = 'league'): Promise<ApiFixtureResponse> {
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
  async getFixturesByIds(
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
} 