import { Module } from '@nestjs/common';
import { MapSlotService } from './map-slot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapSlot } from '../entity/map-slot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MapSlot])],
  providers: [MapSlotService],
  exports: [MapSlotService]
})
export class MapSlotModule {}
