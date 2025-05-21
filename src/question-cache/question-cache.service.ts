import { Inject, Injectable } from '@nestjs/common';
import { QuestionCacheEntity } from '../bigquery/entities/QuestionCacheEntity';
import { BigQueryRepository } from '../bigquery/bigquery.repository';

@Injectable()
export class QuestionCacheService {
  constructor(
    @Inject('QuestionCacheRepository')
    private readonly repository: BigQueryRepository<QuestionCacheEntity>,
  ) {}

  async findAllByQuestionAndRefSource(
    question: string,
    refSource: string,
  ): Promise<QuestionCacheEntity> {
    return this.repository.findOne({
      refSource,
      question,
    });
  }

  async create(questionCache: QuestionCacheEntity) {
    await this.repository.insert(questionCache);
  }
}
