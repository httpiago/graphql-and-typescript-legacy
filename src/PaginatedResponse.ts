import { ObjectType, Field, ID } from "type-graphql";

import User from "./models/user";
import Tweet from "./models/tweet";

@ObjectType({ isAbstract: true })
abstract class PageInfo {
  @Field() size: number;
  @Field(type => ID, { nullable: true }) startCursor?: string;
  @Field(type => ID, { nullable: true }) endCursor?: string;
  @Field({ nullable: true }) hasPreviousPage?: boolean;
  @Field({ nullable: true }) hasNextPage?: boolean;
}

export function PaginatedResponseGeneric<ItemType>(ItemClass) {

  @ObjectType(`${ItemClass.name}Edge`, { isAbstract: true })
  abstract class Edge {
    @Field(type => ItemClass, { description: 'The item at the end of the edge.' })
    node: ItemType;

    @Field({ description: 'A cursor for use in pagination.' })
    cursor: string;
  }

  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponse {
    @Field({ description: 'Identifies the total count of items in the connection.' })
    totalCount: number;

    @Field(type => [Edge], { nullable: 'itemsAndList', description: 'A list of edges.' })
    edges: Array<Edge>;

    @Field(type => [ItemClass], { nullable: 'itemsAndList', description: 'A list of nodes.' })
    nodes: Array<ItemType>;

    @Field(type => PageInfo)
    pageInfo: PageInfo;
    
    @Field(type => String, { nullable: true , description: '"cursor" or "offset"' })
    paginationStyle?: 'cursor' | 'offset';
  }

  return PaginatedResponse
}

@ObjectType()
export class UserConnection extends PaginatedResponseGeneric(User) {}

@ObjectType()
export class TweetConnection extends PaginatedResponseGeneric(Tweet) {}

