import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Team, TeamSchema } from './schemas/team.schema';
import { Page, PageSchema } from './schemas/page.schema';
import { PageRepository } from './repositories/page.repository';
import { Match, MatchSchema } from './schemas/match.schema';
import { MatchRepository } from './repositories/match.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Page.name, schema: PageSchema },
      { name: Match.name, schema: MatchSchema },
    ]),
  ],
  providers: [PageRepository, MatchRepository],
  exports: [PageRepository, MatchRepository, MongooseModule],
})
export class MongoModule {}
