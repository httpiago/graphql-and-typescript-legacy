import { ObjectType, Field, ID } from "type-graphql";
import { Length } from "class-validator";

@ObjectType({ description: 'Data structure of a tweet.' })
class Tweet {
  @Field(type => ID)
  id: number;

  @Field()
  @Length(1, 140)
  content: string;

  @Field(type => ID)
  user_id: string;

  @Field(type => ID, { nullable: true })
  reply_to?: string;

  @Field()
  created_at: string;
}

export default Tweet