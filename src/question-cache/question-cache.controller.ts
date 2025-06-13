import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/authentication/decorators/public.decorator';
import { QuestionCacheService } from './question-cache.service';

@Controller('question-cache')
export class QuestionCacheController {
  constructor(private readonly questionCacheService: QuestionCacheService) {}

@Public()
@Get('question')
getByQuestion(@Query('question') question: string) {
    return this.questionCacheService.findAllByQuestion(question);
}
}


// Atlético Mineiro vs Corinthians - 24/05/2025
