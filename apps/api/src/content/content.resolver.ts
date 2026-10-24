import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLJSON } from 'graphql-type-json';
import { ContentService } from './content.service';
import { ContentType, UpsertContentInput } from './dto/content.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Resolver()
export class ContentResolver {
  constructor(private contentService: ContentService) {}

  @Query(() => ContentType, { nullable: true })
  async content(@Args('key') key: string) {
    const c = await this.contentService.findByKey(key);
    if (!c) return null;
    return {
      id: c._id.toString(),
      key: c.key,
      type: c.type,
      title: c.title,
      content: c.content,
      isPublished: c.isPublished,
    };
  }

  @Query(() => [ContentType])
  async announcements() {
    const items = await this.contentService.findByType('announcement');
    return items.map((c) => ({
      id: c._id.toString(),
      key: c.key,
      type: c.type,
      title: c.title,
      content: c.content,
      isPublished: c.isPublished,
    }));
  }

  @Mutation(() => ContentType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async upsertContent(@Args('input') input: UpsertContentInput, @CurrentUser() user: any) {
    const c = await this.contentService.upsert(input.key, input as any, user?.id);
    return {
      id: c._id.toString(),
      key: c.key,
      type: c.type,
      title: c.title,
      content: c.content,
      isPublished: c.isPublished,
    };
  }
}
