import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Team, TeamSchema } from './schemas/seo/team.schema';
import { Page, PageSchema } from './schemas/seo/page.schema';
import { PageRepository } from './repositories/page.repository';
import { Match, MatchSchema } from './schemas/seo/match.schema';
import { MatchRepository } from './repositories/match.repository';
import {
  QuestionCache,
  QuestionCacheSchema,
} from './schemas/statspro-core-api/question-cache.schema';
import { QuestionCacheRepository } from './repositories/question-cache.repository';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Page.name, schema: PageSchema },
      { name: Match.name, schema: MatchSchema },
      { name: QuestionCache.name, schema: QuestionCacheSchema },
    ]),
    MongooseModule.forFeature(
      [{ name: QuestionCache.name, schema: QuestionCacheSchema }],
      'CoreConnection',
    ),
  ],
  providers: [PageRepository, MatchRepository, QuestionCacheRepository],
  exports: [
    PageRepository,
    MatchRepository,
    QuestionCacheRepository,
    MongooseModule,
  ],
})
export class MongoModule {}
