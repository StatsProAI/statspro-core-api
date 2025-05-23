import { Controller, Get, Query } from '@nestjs/common';
import { CurrentUser } from '../authentication/decorators/current-user.decorator';
import { User } from '@clerk/backend';
import { QuestionService } from './question.service';
import { Public } from '../authentication/decorators/public.decorator';
import {
  QuestionHistoryRequestDto,
  QuestionHistoryDto,
} from './dto/question-history.dto';
import { UserEntity } from '../bigquery/entities/UserEntity';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('histories')
  async getAllHistories(
    @CurrentUser() user: User,
    @Query() query: Partial<QuestionHistoryRequestDto>,
  ): Promise<QuestionHistoryDto[]> {
    console.log(user);
    if (!user) {
      throw new Error('User not found');
    }
    const dto: QuestionHistoryRequestDto = {
      userId: user.id,
      limit: Number(query.limit) || 100,
    };

    return this.questionService.findAllhistories(dto);
  }
}
