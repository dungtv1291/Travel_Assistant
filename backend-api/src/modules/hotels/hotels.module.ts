import { Module } from '@nestjs/common';
import { HotelsController } from './hotels.controller';
import { HotelsRepository } from './repositories/hotels.repository';
import { HotelsService } from './hotels.service';

@Module({
  controllers: [HotelsController],
  providers: [HotelsRepository, HotelsService],
  exports: [HotelsRepository, HotelsService],
})
export class HotelsModule {}
