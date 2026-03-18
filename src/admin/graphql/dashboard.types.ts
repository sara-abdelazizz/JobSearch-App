import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserDashboardType {
  @Field()
  _id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  bannedAt?: Date;
}

@ObjectType()
export class CompanyDashboardType {
  @Field()
  _id: string;

  @Field()
  companyName: string;

  @Field()
  companyEmail: string;

  @Field()
  approvedByAdmin: boolean;

  @Field({ nullable: true })
  bannedAt?: Date;
}

@ObjectType()
export class DashboardDataType {
  @Field(() => [UserDashboardType])
  users: UserDashboardType[];

  @Field(() => [CompanyDashboardType])
  companies: CompanyDashboardType[];
}
