import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

@ObjectType()
export class AuditLogType {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  actorId?: string;

  @Field({ nullable: true })
  actorRole?: string;

  @Field()
  action!: string;

  @Field()
  resourceType!: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field(() => GraphQLJSON)
  metadata!: any;

  @Field({ nullable: true })
  ipAddress?: string;

  @Field({ nullable: true })
  userAgent?: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class AuditLogPage {
  @Field(() => [AuditLogType])
  items!: AuditLogType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field()
  hasMore!: boolean;
}

@InputType()
export class AuditLogFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  to?: string;
}

export function mapAuditLog(log: any): AuditLogType {
  return {
    id: log._id?.toString() || log.id,
    actorId: log.actorId?.toString(),
    actorRole: log.actorRole,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    metadata: log.metadata || {},
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  };
}
