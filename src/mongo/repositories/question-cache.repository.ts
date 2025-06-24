import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QuestionCache,
  QuestionCacheDocument,
} from '../schemas/statspro-core-api/question-cache.schema';
import { RefSource } from '../enum/ref-source.enum';

@Injectable()
export class QuestionCacheRepository {
  constructor(
    @InjectModel(QuestionCache.name, 'CoreConnection')
    private questionCacheModel: Model<QuestionCacheDocument>,
  ) {}

  async create(data: Partial<QuestionCache>): Promise<QuestionCache> {
    return this.questionCacheModel.create(data);
  }

  async findByQuestion(question: string): Promise<QuestionCache | null> {
    return this.questionCacheModel.findOne({ question }).exec();
  }

  async deleteById(id: string): Promise<any> {
    return this.questionCacheModel.findByIdAndDelete(id).exec();
  }

  async findOne(where: Record<string, any>): Promise<QuestionCache | null> {
    const result = await this.questionCacheModel.findOne(where).exec();
    return result;
  }

  async getQuestionCacheWithRefSourceWhatsApp(
    question: string,
  ): Promise<QuestionCache | null> {
    return this.questionCacheModel
      .findOne({
        question,
        ref_source: RefSource.whatsapp,
      })
      .exec();
  }

  async getQuestionCache(question: string): Promise<QuestionCache[]> {
    const results = await this.questionCacheModel
      .find({
        question,
        $or: [{ ref_source: { $exists: false } }, { ref_source: 'site' }],
      })
      .exec();
    return results;
  }

  async getQuestionsCacheByIdAndDate(
    userId: string,
    gameTime: string,
  ): Promise<QuestionCache[]> {
    const questions = await this.questionCacheModel
      .find({
        userId,
        game_time: gameTime,
      })
      .select('question answer')
      .exec();

    return questions;
  }

  async registerQuestionCacheWithRefSource(
    userId: string,
    question: string,
    answer: string,
    gameTime: string,
    refSource: string,
  ): Promise<{ success: boolean }> {
    try {
      await this.create({
        question,
        answer,
        created_at: new Date(),
        userId,
        game_time: gameTime,
        ref_source: refSource as RefSource,
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving question cache:', error);
      throw new Error('Failed to save question cache');
    }
  }

  async registerQuestionCache(
    userId: string,
    question: string,
    answer: string,
    gameTime: string,
  ): Promise<{ success: boolean }> {
    try {
      await this.create({
        question,
        answer,
        created_at: new Date(),
        userId,
        game_time: gameTime,
      });
      return { success: true };
    } catch (error) {
      console.error('Error saving question cache:', error);
      throw new Error('Failed to save question cache');
    }
  }
}
