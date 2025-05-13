import { Injectable, Logger } from '@nestjs/common';
import { Fixture } from './dto/fixture.dto';
import { FixturesRepository } from './repositories/fixtures.repository';

@Injectable()
export class SportMonksService {
  private readonly logger = new Logger(SportMonksService.name);

  constructor(private readonly fixturesRepository: FixturesRepository) {}

  /**
   * Busca fixtures por data
   * @param date Data no formato YYYY-MM-DD
   * @returns Lista de fixtures
   */
  async getFixturesByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures for date: ${date}`);
    return this.fixturesRepository.findByDate(date);
  }
} 