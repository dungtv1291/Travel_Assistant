import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { DestinationsService } from './destinations.service';
import { DestinationsQueryDto } from './dto/destinations-query.dto';
import { LangQueryDto } from './dto/destinations-query.dto';

/**
 * Destinations module controller.
 *
 * Route ordering matters: static segment /featured must be declared BEFORE
 * the dynamic /:slug segment so NestJS does not swallow "featured" as a slug.
 *
 * Auth strategy:
 *  - Browsing endpoints (featured, list, detail) use OptionalJwtAuthGuard so
 *    that the isFavorite field can be populated for authenticated callers while
 *    still serving anonymous callers without a 401.
 *  - Sub-resource endpoints (places, hotels, weather, tips) are fully public.
 */
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly svc: DestinationsService) {}

  // -------------------------------------------------------------------------
  // GET /destinations/featured
  // -------------------------------------------------------------------------

  @Get('featured')
  @UseGuards(OptionalJwtAuthGuard)
  getFeatured(
    @Query() query: LangQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getFeatured({ lang: query.lang, userId: user?.id });
  }

  // -------------------------------------------------------------------------
  // GET /destinations
  // -------------------------------------------------------------------------

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getList(
    @Query() query: DestinationsQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getList({
      search: query.search,
      category: query.category,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      lang: query.lang,
      userId: user?.id,
    });
  }

  // -------------------------------------------------------------------------
  // GET /destinations/:slug
  // NOTE: must come AFTER /featured in the file so NestJS prioritises static
  // segments, but NestJS actually evaluates route specificity correctly.
  // Still, keeping the declaration order explicit is good practice.
  // -------------------------------------------------------------------------

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  getDetail(
    @Param('slug') slug: string,
    @Query() query: LangQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.svc.getDetail(slug, { lang: query.lang, userId: user?.id });
  }

  // -------------------------------------------------------------------------
  // GET /destinations/:id/places
  // -------------------------------------------------------------------------

  @Get(':id/places')
  getPlaces(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LangQueryDto,
  ) {
    return this.svc.getPlaces(id, { lang: query.lang });
  }

  // -------------------------------------------------------------------------
  // GET /destinations/:id/hotels
  // -------------------------------------------------------------------------

  @Get(':id/hotels')
  getHotels(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LangQueryDto,
  ) {
    return this.svc.getHotels(id, { lang: query.lang });
  }

  // -------------------------------------------------------------------------
  // GET /destinations/:id/weather
  // -------------------------------------------------------------------------

  @Get(':id/weather')
  getWeather(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LangQueryDto,
  ) {
    return this.svc.getWeather(id, { lang: query.lang });
  }

  // -------------------------------------------------------------------------
  // GET /destinations/:id/tips
  // -------------------------------------------------------------------------

  @Get(':id/tips')
  getTips(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: LangQueryDto,
  ) {
    return this.svc.getTips(id, { lang: query.lang });
  }
}
