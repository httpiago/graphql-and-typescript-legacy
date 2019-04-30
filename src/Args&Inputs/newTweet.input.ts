import { InputType, Field, ID } from "type-graphql";
import { Length } from "class-validator";
import Tweet from "../models/tweet";

@InputType({ description: 'New tweet data.' })
class NewTweetInput implements Partial<Tweet> {
  @Field()
  @Length(1, 140)
  content: string;

  @Field(type => ID, { nullable: true, description: 'The Node ID of the original tweet.' })
  reply_to?: string;
}

export default NewTweetInput