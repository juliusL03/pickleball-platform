import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

@ObjectType()
export class UserAdminType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  role!: string;

  @Field()
  status!: string;

  @Field(() => [String])
  permissions!: string[];

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CustomerType {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class CustomerDetail {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field()
  firstName!: string;

  @Field()
  lastName!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  status!: string;

  @Field({ nullable: true })
  lastLoginAt?: Date;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class CustomerPage {
  @Field(() => [CustomerType])
  items!: CustomerType[];

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
export class CustomerFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;
}

@InputType()
export class CreateStaffInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

@InputType()
export class UpdateStaffInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export function mapUserAdmin(user: any): UserAdminType {
  return {
    id: user._id?.toString() || user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    status: user.status,
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function mapCustomer(user: any): CustomerType {
  return {
    id: user._id?.toString() || user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}
