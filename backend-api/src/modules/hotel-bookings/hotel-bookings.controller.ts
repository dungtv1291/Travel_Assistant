import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { HotelBookingsService } from './hotel-bookings.service';

@Controller('hotel-bookings')
@UseGuards(JwtAuthGuard)
export class HotelBookingsController {
  constructor(private readonly svc: HotelBookingsService) {}

  @Post()
  create(
    @Body() dto: CreateHotelBookingDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.svc.createBooking(dto, user.id);
  }
}
