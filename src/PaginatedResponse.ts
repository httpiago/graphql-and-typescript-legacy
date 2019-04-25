import { ObjectType, Field, ClassType, ID } from "type-graphql";

import User from "./models/user";

@ObjectType({ isAbstract: true })
abstract class PageInfo {
  @Field() size: number;
  @Field(type => ID) startCursor: string;
  @Field(type => ID) endCursor: string;
  @Field() hasPreviousPage: boolean;
  @Field() hasNextPage: boolean;
}

export function PaginatedResponse<ItemType>(ItemClass: ClassType<ItemType>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field()
    total: number;

    @Field(type => [ItemClass])
    items: Array<ItemType>;

    @Field(type => PageInfo)
    pageInfo: PageInfo;
  }

  return PaginatedResponseClass
}

@ObjectType()
export class PaginatedUserResponse extends PaginatedResponse(User) { }
