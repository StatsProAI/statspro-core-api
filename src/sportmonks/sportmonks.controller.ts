import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SportMonksService } from './sportmonks.service';
import { Fixture } from './fixture.dto';

@ApiTags('sportmonks')
@Controller('sportmonks')
export class SportMonksController {
  private readonly logger = new Logger(SportMonksController.name);

  constructor(private readonly sportMonksService: SportMonksService) {}

  @Get('fixtures/date/:date')
  @ApiOperation({ summary: 'Get fixtures by date with simplified data' })
  @ApiParam({
    name: 'date',
    description: 'Date in YYYY-MM-DD format',
    example: '2025-05-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Fixtures retrieved successfully',
  })
  async getFixturesByDate(@Param('date') date: string): Promise<Fixture[]> {
    return this.sportMonksService.getFixturesByDate(date);
  }

  @Get('fixtures/multi/:ids')
  @ApiOperation({ summary: 'Get multiple fixtures by IDs' })
  @ApiParam({
    name: 'ids',
    description: 'Comma-separated fixture IDs',
    example: '16475287,11865351',
  })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Additional data to include, separated by semicolons',
    example: 'participants;statistics;timeline;events',
  })
  @ApiResponse({
    status: 200,
    description: 'Fixtures retrieved successfully',
  })
  async getFixturesByIds(
    @Param('ids') ids: string,
    @Query('include') include?: string,
  ): Promise<Fixture[]> {
    this.logger.debug(
      `Received request for fixtures with IDs: ${ids}, include: ${include}`,
    );

    const decodedIds = decodeURIComponent(ids);
    const decodedIncludes = include ? decodeURIComponent(include) : undefined;

    return this.sportMonksService.getFixturesByIds(decodedIds, decodedIncludes);
  }
}
