import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@ObjectType()
export class AddressType {
  @Field()
  street!: string;
  @Field()
  city!: string;
  @Field()
  province!: string;
  @Field({ nullable: true })
  postalCode?: string;
  @Field()
  country!: string;
}

@ObjectType()
export class ContactType {
  @Field({ nullable: true })
  phone?: string;
  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class VenueType {
  @Field()
  id!: string;
  @Field()
  name!: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => AddressType)
  address!: AddressType;
  @Field(() => ContactType)
  contact!: ContactType;
  @Field({ nullable: true })
  logoUrl?: string;
}

@InputType()
export class UpdateVenueInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
