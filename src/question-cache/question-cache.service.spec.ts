import { Test, TestingModule } from '@nestjs/testing';
import { QuestionCacheService } from './question-cache.service';

describe('QuestionCacheService', () => {
  let service: QuestionCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionCacheService],
    }).compile();

    service = module.get<QuestionCacheService>(QuestionCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
