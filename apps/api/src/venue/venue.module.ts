import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Venue, VenueSchema } from './schemas/venue.schema';
import { VenueService } from './venue.service';
import { VenueResolver } from './venue.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Venue.name, schema: VenueSchema }]),
  ],
  providers: [VenueService, VenueResolver],
  exports: [VenueService],
})
export class VenueModule {}
