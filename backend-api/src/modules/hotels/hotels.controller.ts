import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { HotelQueryDto } from './dto/hotel-query.dto';
import { HotelsService } from './hotels.service';

@Controller('hotels')
@UseGuards(OptionalJwtAuthGuard)
export class HotelsController {
  constructor(private readonly svc: HotelsService) {}

  @Get('recommended')
  getRecommended(
    @Query('lang') lang?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getRecommended({ lang, userId: user?.id });
  }

  @Get()
  getList(
    @Query() query: HotelQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getList(query, user?.id);
  }

  @Get(':id')
  getDetail(
    @Param('id') id: string,
    @Query('lang') lang?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getDetail(id, { lang, userId: user?.id });
  }

  @Get(':id/rooms')
  getRooms(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.svc.getRooms(Number(id), { lang });
  }

  @Get(':id/amenities')
  getAmenities(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.svc.getAmenities(Number(id), { lang });
  }

  @Get(':id/policies')
  getPolicies(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.svc.getPolicies(Number(id), { lang });
  }

  @Get(':id/reviews')
  getReviews(
    @Param('id') id: string,
    @Query('lang') lang?: string,
  ) {
    return this.svc.getReviews(Number(id), { lang });
  }
}
