import { Inject, Injectable, Logger } from '@nestjs/common';
import { BigQueryRepository } from '../bigquery/bigquery.repository';
import { QuestionEntity } from '../bigquery/entities/QuestionEntity';
import {
  QuestionHistoryRequestDto,
  QuestionHistoryDto,
} from './dto/question-history.dto';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @Inject('QuestionRepository')
    private readonly repository: BigQueryRepository<QuestionEntity>,
  ) {}

  async create(question: QuestionEntity) {
    await this.repository.insert(question);
  }

  async findAllhistories(
    dto: QuestionHistoryRequestDto,
  ): Promise<QuestionHistoryDto[]> {
    const { userId, limit } = dto;
    try {
      this.logger.log(
        `🔍 Starting of fetching user history: userId: ${userId}`,
      );

      const histories = await this.repository.findAll({
        where: { userId },
        orderBy: { createdAt: 'DESC' },
        limit: limit,
      });

      if (!histories || histories.length === 0) {
        this.logger.log(`❌ No histories found for userId: ${userId}`);
        return [];
      }
      this.logger.log(
        `✅ Found ${histories.length} histories for userId: ${userId}`,
      );

      const formattedHistories = histories.map((history) => ({
        type: history.type,
        question: history.question,
        answer: history.answer,
        created_at: history.createdAt,
      }));
      this.logger.log(`✅ histories returned for userId: ${userId}`);

      return formattedHistories as QuestionHistoryDto[];
    } catch (error) {
      this.logger.error(
        `❌ Failed to find histories: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
