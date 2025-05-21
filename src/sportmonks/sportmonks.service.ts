import { Injectable, Logger } from '@nestjs/common';
import { Fixture } from './fixture.dto';
import { FixtureMapper } from './fixture.mapper';
import { SportMonksRepository } from './sportmonks.repository';

@Injectable()
export class SportMonksService {
  private readonly logger = new Logger(SportMonksService.name);

  constructor(
    private readonly sportMonksRepository: SportMonksRepository,
  ) {}

  async getAllFixturesByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures for date: ${date}`);

    try {
      const response = await this.sportMonksRepository.getFixturesByDate(date);
      const fixtures = response.data as Fixture[];
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

  async getFixturesByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures for date: ${date}`);

    try {
      const response = await this.sportMonksRepository.getFixturesByDate(date);
      
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
      const response = await this.sportMonksRepository.getFixturesByIds(
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