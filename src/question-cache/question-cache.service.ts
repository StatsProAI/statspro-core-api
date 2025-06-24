import { Inject, Injectable } from '@nestjs/common';
import { QuestionCacheEntity } from '../bigquery/entities/QuestionCacheEntity';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { QuestionCacheRepository } from 'src/mongo/repositories/question-cache.repository';
import { QuestionCache } from 'src/mongo/schemas/statspro-core-api/question-cache.schema';

@Injectable()
export class QuestionCacheService {
  constructor(
    @Inject('QuestionCacheRepository')
    private readonly repository: BigQueryRepository<QuestionCacheEntity>,
    private readonly questionCacheRepository: QuestionCacheRepository,
  ) {}

  // async findAllByQuestionAndRefSource(
  //   question: string,
  //   refSource: string,
  // ): Promise<QuestionCacheEntity> {
  //   return this.repository.findOne({
  //     refSource,
  //     question,
  //   });
  // }

  // async create(questionCache: QuestionCacheEntity) {
  //   await this.repository.insert(questionCache);
  // }

  async findAllByQuestionAndRefSource(
    question: string,
    refSource: string,
  ): Promise<QuestionCache> {
    return this.questionCacheRepository.findOne({ question, refSource });
  }

  async create(questionCache: QuestionCache) {
    await this.questionCacheRepository.create(questionCache);
  }

  async findAllByQuestion(question: string): Promise<QuestionCache> {
    return this.questionCacheRepository.findOne({ question });
  }

  // new
  async getQuestionCacheWithRefSourceWhatsApp(
    question: string,
  ): Promise<QuestionCache | null> {
    return this.questionCacheRepository.getQuestionCacheWithRefSourceWhatsApp(
      question,
    );
  }

  async getQuestionCache(question: string): Promise<QuestionCache | null> {
    return this.questionCacheRepository.getQuestionCache(question);
  }

  async getQuestionsCacheByIdAndDate(
    userId: string,
    gameTime: string,
  ): Promise<QuestionCache[]> {
    return this.questionCacheRepository.getQuestionsCacheByIdAndDate(
      userId,
      gameTime,
    );
  }

  async registerQuestionCacheWithRefSource(
    userId: string,
    question: string,
    answer: string,
    gameTime: string,
    refSource: string,
  ): Promise<{ success: boolean }> {
    return this.questionCacheRepository.registerQuestionCacheWithRefSource(
      userId,
      question,
      answer,
      gameTime,
      refSource,
    );
  }

  async registerQuestionCache(
    userId: string,
    question: string,
    answer: string,
    gameTime: string,
  ): Promise<{ success: boolean }> {
    return this.questionCacheRepository.registerQuestionCache(
      userId,
      question,
      answer,
      gameTime,
    );
  }
}
