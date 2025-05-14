import { Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class HttpClient {
  private readonly logger = new Logger(HttpClient.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    baseURL: string, 
    timeout: number = 30000, 
    private readonly defaultParams: Record<string, any> = {}
  ) {
    this.httpClient = axios.create({
      baseURL,
      timeout,
    });
  }

  /**
   * Executa uma chamada GET para uma API
   * @param endpoint Endpoint a ser chamado
   * @param params Parâmetros adicionais para a requisição
   * @returns Resposta da API
   */
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const config: AxiosRequestConfig = {
        params: {
          ...this.defaultParams,
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
} 