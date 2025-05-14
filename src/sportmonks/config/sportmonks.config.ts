import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configuração para a integração com a API SportMonks
 */
@Injectable()
export class SportMonksConfig {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Token de API para autenticação nas requisições
   */
  get apiToken(): string {
    return this.configService.get<string>('SPORTMONKS_API_TOKEN');
  }

  /**
   * URL base da API SportMonks
   */
  get baseUrl(): string {
    return this.configService.get<string>('SPORTMONKS_BASE_URL', 'https://api.sportmonks.com/v3');
  }

  /**
   * Timeout para requisições em milissegundos
   */
  get timeout(): number {
    return this.configService.get<number>('SPORTMONKS_TIMEOUT', 10000);
  }
} 