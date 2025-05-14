import { Injectable, Logger } from '@nestjs/common';
import { Fixture } from './dto/fixture.dto';
import { SportMonksApiRepository } from './repositories/sportmonks-api.repository';

@Injectable()
export class SportMonksService {
  private readonly logger = new Logger(SportMonksService.name);

  constructor(private readonly sportmonksRepository: SportMonksApiRepository) {}

  /**
   * Busca fixtures por data
   * @param date Data no formato YYYY-MM-DD
   * @returns Lista de fixtures
   */
  async getFixturesByDate(date: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures for date: ${date}`);
    return this.sportmonksRepository.findByDate(date);
  }

  /**
   * Busca fixtures por IDs
   * @param ids Lista de IDs de fixtures separados por vírgula
   * @param includes Dados adicionais a serem incluídos
   * @returns Lista de fixtures
   */
  async getFixturesByIds(ids: string, includes?: string): Promise<Fixture[]> {
    this.logger.log(`Getting fixtures by IDs: ${ids}`);

    // Converte a string de IDs em um array de números
    const fixtureIds = ids.split(',').map((id) => parseInt(id.trim(), 10));

    // Converte a string de includes para um array se existir
    const includesArray = includes ? includes.split(';') : [];
<<<<<<< HEAD
    
    return this.sportmonksRepository.findByIds(fixtureIds, includesArray);
=======

    return this.fixturesRepository.findByIds(fixtureIds, includesArray);
>>>>>>> origin/develop
  }
}
