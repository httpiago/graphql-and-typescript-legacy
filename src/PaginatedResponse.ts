import { ObjectType, Field, ClassType, ID } from "type-graphql";

import User from "./models/user";

@ObjectType({ isAbstract: true })
abstract class PageInfo {
  @Field() size: number;
  @Field(type => ID, { nullable: true }) startCursor?: string;
  @Field(type => ID, { nullable: true }) endCursor?: string;
  @Field() hasPreviousPage: boolean;
  @Field() hasNextPage: boolean;
}

export function PaginatedResponse<ItemType>(ItemClass) {

  @ObjectType({ isAbstract: true })
  abstract class Node extends ItemClass {
    @Field({ description: 'A cursor for use in pagination.' }) cursor: string;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field()
    totalCount: number;

    @Field(type => [Node], { nullable: 'items' })
    items: Array<Node>;

    @Field(type => PageInfo)
    pageInfo: PageInfo;
    
    @Field(type => String, { description: '"cursor" or "offset"' })
    paginationStyle: 'cursor' | 'offset';
  }

  return PaginatedResponseClass
}

@ObjectType()
export class PaginatedUserResponse extends PaginatedResponse(User) { }
