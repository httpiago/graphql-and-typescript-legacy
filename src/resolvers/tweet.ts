import { Resolver, Query, Arg, Args, FieldResolver, Root, Mutation, Authorized, Ctx } from "type-graphql";
import { TweetConnection } from "../paginatedResponse";
import PaginationArgs from "../args&inputs/pagination.args";
import { getPaginatedRowsFromTable } from "../../utils";
import Tweet from "../models/tweet";
import User from "../models/user";
import db from "../../database";
import { userColumns } from "./user";
import NewTweetInput from "../args&inputs/newTweet.input";
import { Context } from "../../types";
import GenericError from "../genericError";

@Resolver(of => Tweet)
class TweetResolvers {

  @FieldResolver(returns => User, { description: 'The actor who authored the Tweet.', complexity: 4 })
  async author(
    @Root() { user_id }: Tweet
  ): Promise<User> {
    return await db.select(userColumns).from('users').where({ id: user_id }).first() as User
  }

  @FieldResolver(returns => Tweet, { nullable: true, description: 'The tweet associated with this node.', complexity: 4 })
  async replyTweet(
    @Root() { reply_to }: Tweet
  ): Promise<Tweet | null> {
    if (reply_to === null) return;
    else {
      return await db.select('*').from('tweets').where({ id: reply_to }).first() as Tweet
    }
  }

  @FieldResolver(returns => TweetConnection, { description: 'Get for all tweets that are marked as a response from tweet.', complexity: 10 })
  async replies(
    @Root() originalTweet: Tweet,
    @Args() { first, offset, after }: PaginationArgs
  ) {
    return await getPaginatedRowsFromTable({
      tableName: 'tweets',
      columns: '*',
      where: [`reply_to = "${originalTweet.id}"`],
      after,
      first,
      offset,
    });
  }

  @FieldResolver(returns => Number, { description: 'Count how many likes a tweet has.', complexity: 4 })
  async likesCount(
    @Root() tweetInfos: Tweet,
  ): Promise<number> {
    // Conta
    return await db.select('*')
      .from('tweets')
      .innerJoin('tweets_likes', 'tweets.id', '=', 'tweets_likes.tweet_id')
      .where('tweets.id', '=', tweetInfos.id)
      .then(res => res.length || 0) as number
  }

  @FieldResolver(returns => [User], { description: 'A list of users who have liked the tweet', complexity: 4 })
  async peopleWhoLiked(
    @Root() tweetInfos: Tweet
  ): Promise<User[]> {
    return await db.select(userColumns.map(c => `users.${c}`))
      .from('users')
      .innerJoin('tweets_likes', 'users.id', '=', 'tweets_likes.user_id')
      .where('tweet_id', '=', tweetInfos.id)
  }


  @Query(returns => Tweet, { description: 'Get a specific tweet by id.', complexity: 1 })
  async tweet(
    @Arg('id') id: string,
  ): Promise<Tweet> {
    const tweet = await db.select('*').from('tweets').where({ id }).first() as Tweet

    return tweet
  }


  @Query(returns => TweetConnection, { description: 'Search latest tweets.', complexity: 10 })
  async tweets(
    @Args() { first, offset, after }: PaginationArgs,
    @Arg('fromUser', { nullable: true }) fromUser?: string,
  ) {
    return await getPaginatedRowsFromTable({
      tableName: 'tweets',
      columns: '*',
      where: [`"user_id" = ${fromUser}`],
      after,
      first,
      offset,
    });
  }


  @Authorized(['admin', 'writer'])
  @Mutation(returns => Tweet, { description: 'Create a new tweet.', complexity: 5 })
  async createTweet(
    @Arg('input') input: NewTweetInput,
    @Ctx() { currentUserId }: Context
  ): Promise<Tweet> {
    return await db.insert({
      ...input,
      user_id: currentUserId,
      created_at: new Date().toISOString()
    })
      .into('tweets')
      .returning('*')
      .then(res => res[0])
  }


  @Authorized(['admin', 'writer'])
  @Mutation(returns => String, { description: 'Delete tweet by id.', complexity: 5 })
  async deleteTweet(
    @Arg('id') id: string,
    @Ctx() { currentUserId }: Context
  ): Promise<string> {
    const tweet = await db.select('*').from('tweets').where({ id }).first() as Tweet

    if (typeof tweet === 'undefined') throw new GenericError('NOT_FOUND', 'No tweets with this id were found.');
    if (currentUserId != tweet.user_id) throw new GenericError('FORBIDDEN', 'You are not allowed to perform this action!');

    // Delete tweet
    const result = await db.delete().from('tweets').where({ id })
    
    if (result === 0) throw new GenericError('UNKNOWN', 'There was a problem deleting Tweet.');

    return `Done!`
  }
}

export default TweetResolvers