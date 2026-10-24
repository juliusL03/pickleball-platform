import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtType, CreateCourtInput, UpdateCourtInput } from './dto/court.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver()
export class CourtsResolver {
  constructor(private courtsService: CourtsService) {}

  @Query(() => [CourtType])
  async courts() {
    const courts = await this.courtsService.findAll();
    return courts.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      amenities: c.amenities || [],
      images: c.images || [],
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    }));
  }

  @Query(() => CourtType, { nullable: true })
  async court(@Args('slug') slug: string) {
    const c = await this.courtsService.findBySlug(slug);
    if (!c) return null;
    return {
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      amenities: c.amenities || [],
      images: c.images || [],
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    };
  }

  @Mutation(() => CourtType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async createCourt(@Args('input') input: CreateCourtInput) {
    const c = await this.courtsService.create(input as any);
    return {
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      amenities: c.amenities || [],
      images: c.images || [],
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    };
  }

  @Mutation(() => CourtType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async updateCourt(@Args('id') id: string, @Args('input') input: UpdateCourtInput) {
    const c = await this.courtsService.update(id, input as any);
    if (!c) throw new Error('Court not found');
    return {
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      amenities: c.amenities || [],
      images: c.images || [],
      isActive: c.isActive,
      sortOrder: c.sortOrder,
    };
  }
}
