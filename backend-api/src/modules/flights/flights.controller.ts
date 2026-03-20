import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RecommendFlightsDto } from './dto/recommend-flights.dto';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightsService } from './flights.service';

@Controller('flights')
@UseGuards(OptionalJwtAuthGuard)
export class FlightsController {
  constructor(private readonly svc: FlightsService) {}

  /**
   * GET /api/v1/flights/deals
   * Public — no auth required.
   * Returns curated cheap flight deals for the home-screen carousel.
   */
  @Get('deals')
  getDeals() {
    return this.svc.getDeals();
  }

  /**
   * POST /api/v1/flights/search
   * Auth optional — userId captured for logging when present.
   */
  @Post('search')
  searchFlights(
    @Body() dto: SearchFlightsDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.searchFlights(dto, user?.id);
  }

  /**
   * POST /api/v1/flights/recommend
   * Uses the searchId returned by /flights/search to look up cached results
   * and calls the AI service.  Auth optional.
   */
  @Post('recommend')
  recommendFlights(@Body() dto: RecommendFlightsDto) {
    return this.svc.recommendFlights(dto);
  }
}
