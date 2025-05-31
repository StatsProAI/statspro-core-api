import { Injectable } from '@nestjs/common';
import { HttpService } from '../common/http/http.service';

@Injectable()
export class AuroraService {
  constructor(private readonly httpService: HttpService) {}

  async handleAnalisy(
    team1: string,
    team2: string,
    title: string,
    userId: string | null,
    date: string | null = null,
    type: 'whatsapp' | 'web' = 'web',
  ): Promise<string> {
    const url = new URL(`${process.env.API_AURORA}/analysis`);

    url.searchParams.append('title', title);
    url.searchParams.append('team1', team1);
    url.searchParams.append('team2', team2);
    url.searchParams.append('type', type);
    if (date) {
      url.searchParams.append('date', date);
    }

    const headers: Record<string, string> = {
      accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (userId) {
      headers['X-User-ID'] = userId;
    }

    try {
      return this.httpService.post<string>(url.toString(), {}, { 
        headers,
        timeout: 60000 // Increased to 60 seconds timeout
      });
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout after ${error.timeout}ms for game ${team1} vs ${team2}`);
      }
      throw new Error(
        `HTTP error! status: ${error.response?.status} - ${error.response?.data || error.message}`,
      );
    }
  }
}
