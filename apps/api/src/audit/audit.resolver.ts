import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { AuditLogFilterInput, AuditLogPage, mapAuditLog } from './dto/audit.dto';

@Resolver()
export class AuditResolver {
  constructor(private readonly auditService: AuditService) {}

  @Query(() => AuditLogPage)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner')
  @RequirePermissions('audit.read')
  async auditLogs(
    @Args('filter', { nullable: true }) filter?: AuditLogFilterInput,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<AuditLogPage> {
    const safeLimit = Math.min(limit || 50, 100);
    const safeOffset = offset || 0;
    const { items, total } = await this.auditService.findAll(
      filter || {},
      safeLimit,
      safeOffset,
    );
    return {
      items: items.map(mapAuditLog),
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  }
}
