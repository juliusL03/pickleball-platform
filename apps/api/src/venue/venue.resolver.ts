import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { VenueService } from './venue.service';
import { VenueType, UpdateVenueInput } from './dto/venue.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver()
export class VenueResolver {
  constructor(private venueService: VenueService) {}

  @Query(() => VenueType, { nullable: true })
  async venue() {
    const v = await this.venueService.findOne();
    if (!v) return null;
    return {
      id: v._id.toString(),
      name: v.name,
      description: v.description,
      address: v.address,
      contact: v.contact,
      logoUrl: v.logoUrl,
    };
  }

  @Mutation(() => VenueType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async updateVenue(@Args('input') input: UpdateVenueInput) {
    const v = await this.venueService.createOrUpdate(input);
    return {
      id: v._id.toString(),
      name: v.name,
      description: v.description,
      address: v.address,
      contact: v.contact,
      logoUrl: v.logoUrl,
    };
  }
}
