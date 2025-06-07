import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QuestionCache,
  QuestionCacheDocument,
} from '../schemas/statspro-core-api/question-cache.schema';

@Injectable()
export class QuestionCacheRepository {
  constructor(
    @InjectModel(QuestionCache.name)
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
}
