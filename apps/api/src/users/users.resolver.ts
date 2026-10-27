import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ALLOWED_PERMISSIONS, UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import {
  CreateStaffInput,
  CustomerDetail,
  CustomerFilterInput,
  CustomerPage,
  CustomerType,
  UpdateStaffInput,
  UserAdminType,
  mapCustomer,
  mapUserAdmin,
} from './dto/user-admin.dto';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  @Query(() => [UserAdminType])
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner')
  @RequirePermissions('staff.manage')
  async staff(): Promise<UserAdminType[]> {
    const staff = await this.usersService.findStaff();
    return staff.map(mapUserAdmin);
  }

  @Query(() => [String])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner')
  async staffPermissions(): Promise<string[]> {
    return ALLOWED_PERMISSIONS;
  }

  @Mutation(() => UserAdminType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner')
  @RequirePermissions('staff.manage')
  async createStaff(
    @Args('input') input: CreateStaffInput,
    @CurrentUser() user: any,
  ): Promise<UserAdminType> {
    const staff = await this.usersService.createStaff(input);
    await this.auditService.log({
      actorId: user?.id,
      actorRole: user?.role,
      action: 'staff.created',
      resourceType: 'user',
      resourceId: staff._id?.toString(),
      metadata: { email: staff.email, permissions: staff.permissions },
    });
    return mapUserAdmin(staff);
  }

  @Mutation(() => UserAdminType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner')
  @RequirePermissions('staff.manage')
  async updateStaff(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStaffInput,
    @CurrentUser() user: any,
  ): Promise<UserAdminType> {
    const staff = await this.usersService.updateStaff(id, input, user?.id);
    if (!staff) {
      throw new Error('Staff not found');
    }
    await this.auditService.log({
      actorId: user?.id,
      actorRole: user?.role,
      action: 'staff.updated',
      resourceType: 'user',
      resourceId: staff._id?.toString(),
      metadata: { status: staff.status, permissions: staff.permissions },
    });
    return mapUserAdmin(staff);
  }

  @Query(() => CustomerPage)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('customers.read')
  async customers(
    @Args('filter', { nullable: true }) filter?: CustomerFilterInput,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<CustomerPage> {
    const safeLimit = Math.min(limit || 50, 100);
    const safeOffset = offset || 0;
    const { items, total } = await this.usersService.findCustomers(
      filter || {},
      safeLimit,
      safeOffset,
    );
    return {
      items: items.map(mapCustomer),
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  }

  @Query(() => CustomerDetail)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('customers.read')
  async customer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CustomerDetail> {
    const customer = await this.usersService.findCustomerById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return {
      id: (customer as any)._id?.toString() || (customer as any).id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      status: customer.status,
      lastLoginAt: customer.lastLoginAt,
      createdAt: (customer as any).createdAt,
    };
  }
}
