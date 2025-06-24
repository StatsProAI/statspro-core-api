import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/authentication/decorators/public.decorator';
import { QuestionCacheService } from './question-cache.service';

interface RegisterQuestionCacheDto {
  userId: string;
  question: string;
  answer: string;
  gameTime: string;
  refSource?: string;
}

// REMOVER O PUBLIC DAS ROTAS
@Controller('question-cache')
export class QuestionCacheController {
  constructor(private readonly questionCacheService: QuestionCacheService) {}

  @Public()
  @Get('question')
  getByQuestion(@Query('question') question: string) {
    return this.questionCacheService.findAllByQuestion(question);
  }

  @Public()
  @Get('whatsapp')
  getWhatsAppQuestion(@Query('question') question: string) {
    return this.questionCacheService.getQuestionCacheWithRefSourceWhatsApp(
      question,
    );
  }

  @Public()
  @Get('site')
  getSiteQuestion(@Query('question') question: string) {
    const result = this.questionCacheService.getQuestionCache(question);
    console.log(result, '<-- result');
    return result;
  }

  @Public()
  @Get('user')
  getUserQuestions(
    @Query('userId') userId: string,
    @Query('gameTime') gameTime: string,
  ) {
    return this.questionCacheService.getQuestionsCacheByIdAndDate(
      userId,
      gameTime,
    );
  }

  @Public()
  @Post('register')
  async registerQuestion(@Body() data: RegisterQuestionCacheDto) {
    const { userId, question, answer, gameTime, refSource } = data;

    if (refSource) {
      return this.questionCacheService.registerQuestionCacheWithRefSource(
        userId,
        question,
        answer,
        gameTime,
        refSource,
      );
    }

    return this.questionCacheService.registerQuestionCache(
      userId,
      question,
      answer,
      gameTime,
    );
  }
}
