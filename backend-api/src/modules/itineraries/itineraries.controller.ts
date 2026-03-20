import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { ItineraryQueryDto } from './dto/itinerary-query.dto';
import { RegenerateItineraryDto } from './dto/regenerate-itinerary.dto';
import { ItinerariesService } from './itineraries.service';

@Controller('itineraries')
@UseGuards(JwtAuthGuard)
export class ItinerariesController {
  constructor(private readonly itinerariesService: ItinerariesService) {}

  /** POST /api/v1/itineraries/generate */
  @Post('generate')
  generate(
    @Body() dto: GenerateItineraryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itinerariesService.generate(dto, user.id);
  }

  /** GET /api/v1/itineraries */
  @Get()
  list(
    @Query() query: ItineraryQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itinerariesService.list(user.id, query);
  }

  /** GET /api/v1/itineraries/:id */
  @Get(':id')
  getById(
    @Param('id') publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itinerariesService.getById(publicId, user.id);
  }

  /** POST /api/v1/itineraries/:id/save */
  @Post(':id/save')
  save(
    @Param('id') publicId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itinerariesService.save(publicId, user.id);
  }

  /** POST /api/v1/itineraries/:id/regenerate */
  @Post(':id/regenerate')
  regenerate(
    @Param('id') publicId: string,
    @Body() dto: RegenerateItineraryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itinerariesService.regenerate(publicId, dto, user.id);
  }
}
