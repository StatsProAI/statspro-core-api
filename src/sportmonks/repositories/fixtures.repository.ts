import { Injectable, Logger } from '@nestjs/common';
import { SportMonksApiClient } from '../clients/sportmonks-api.client';
import { ApiFixture } from '../types/api-response.types';
import { Fixture } from '../dto/fixture.dto';

@Injectable()
export class FixturesRepository {
  private readonly logger = new Logger(FixturesRepository.name);

  constructor(private readonly apiClient: SportMonksApiClient) {}


  async findByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Finding fixtures for date: ${date}`);
    
    try {
      const response = await this.apiClient.getFixturesByDate(date);
      
      const fixtures = response.data.map(fixture => this.mapToFixture(fixture));
      
      this.logger.log(`Found ${fixtures.length} fixtures for date: ${date}`);
      return fixtures;
    } catch (error) {
      this.logger.error(`Failed to find fixtures: ${error.message}`, error.stack);
      throw error;
    }
  }


  private mapToFixture(apiFixture: ApiFixture): Fixture {
    return {
      id: apiFixture.id,
      league: {
        id: apiFixture.league.id,
        name: apiFixture.league.name,
        country_id: apiFixture.league.country_id,
        image_path: apiFixture.league.image_path,
      },
    };
  }
} 