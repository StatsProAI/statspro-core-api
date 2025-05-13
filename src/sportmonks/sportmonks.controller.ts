import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SportMonksService } from './sportmonks.service';
import { Fixture } from './dto/fixture.dto';
import { Public } from '../authentication/decorators/public.decorator';

@ApiTags('sportmonks')
@Controller('sportmonks')
export class SportMonksController {
  constructor(private readonly sportMonksService: SportMonksService) {}

  @Public()
  @Get('fixtures/date/:date')
  @ApiOperation({ summary: 'Get fixtures by date with simplified data' })
  @ApiParam({ name: 'date', description: 'Date in YYYY-MM-DD format', example: '2025-05-15' })
  @ApiResponse({ 
    status: 200, 
    description: 'Fixtures retrieved successfully',
  })
  async getFixturesByDate(
    @Param('date') date: string
  ): Promise<Fixture[]> {
    return this.sportMonksService.getFixturesByDate(date);
  }
} 