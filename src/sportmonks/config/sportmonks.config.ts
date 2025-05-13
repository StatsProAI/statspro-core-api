import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SportMonksConfig {
  private readonly _apiToken: string;
  private readonly _baseUrl: string;
  private readonly _timeout: number;

  constructor(private readonly configService: ConfigService) {
    this._apiToken = this.configService.get<string>('SPORTMONKS_API_TOKEN');
    this._baseUrl = this.configService.get<string>('SPORTMONKS_BASE_URL', 'https://api.sportmonks.com/v3');
    this._timeout = this.configService.get<number>('SPORTMONKS_TIMEOUT', 10000);
  }

  get apiToken(): string {
    return this._apiToken;
  }

  get baseUrl(): string {
    return this._baseUrl;
  }

  get timeout(): number {
    return this._timeout;
  }
} 