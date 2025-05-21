import { Inject, Injectable } from '@nestjs/common';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { QuestionEntity } from '../bigquery/entities/QuestionEntity';

@Injectable()
export class QuestionService {
  constructor(
    @Inject('QuestionRepository')
    private readonly repository: BigQueryRepository<QuestionEntity>,
  ) {}

  async create(question: QuestionEntity) {
    await this.repository.insert(question);
  }
}
