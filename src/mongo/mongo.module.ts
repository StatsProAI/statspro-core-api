import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { Team, TeamSchema } from './schemas/team.schema';
import { Page, PageSchema } from './schemas/page.schema';
import { PageRepository } from './repositories/page.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Page.name, schema: PageSchema },
    ]),
  ],
  providers: [ PageRepository],
  exports: [ PageRepository, MongooseModule],
})
export class MongoModule {}