import { Resolver, Mutation, Arg, Authorized, Ctx, ID } from "type-graphql";
import db from "../../database";
import { Context } from "../../types";
import GenericError from "../genericError";

@Resolver()
class LikesResolvers {
  
  @Authorized()
  @Mutation(returns => String, { description: 'Add a like to a tweet by id.', complexity: 10 })
  async addLike(
    @Arg('tweetId', type => ID) tweetId: string,
    @Ctx() { currentUserId }: Context
  ): Promise<string> {
    const checkTweetExist = await db.select('*')
      .from('tweets')
      .where({ id: tweetId })
      .first()
      .then(res => typeof res !== 'undefined')

    if (checkTweetExist === false) throw new GenericError('NOT_FOUND', 'No tweet with this id were found.');

    const checkIfAlreadyLiked = await db.count('* as total')
      .from('tweets_likes')
      .where({ tweet_id: tweetId, user_id: currentUserId })
      .then(res => Number(res[0].total) > 0)

    if (checkIfAlreadyLiked === true) throw new GenericError('FORBIDDEN', 'You already liked this tweet.');

    try {
      await db.insert({
        tweet_id: tweetId,
        user_id: currentUserId,
        created_at: new Date().toISOString()
      })
      .into('tweets_likes')
      
      return 'Done.';
    }
    catch(err) {
      throw new GenericError('UNKNOWN', 'There was a problem liking this tweet.');
    }
  }

  @Mutation(returns => String, { description: 'Remove like from a tweet by id.', complexity: 10 })
  async removeLike(
    @Arg('tweetId', type => ID) tweetId: string,
    @Ctx() { currentUserId }: Context
  ): Promise<string>  {
    const checkTweetExist = await db.select('*')
      .from('tweets')
      .where({ id: tweetId })
      .first()
      .then(res => typeof res !== 'undefined')

    if (checkTweetExist === false) throw new GenericError('NOT_FOUND', 'No tweet with this id were found.');

    const checkIfAlreadyLiked = await db.count('* as total')
      .from('tweets_likes')
      .where({ tweet_id: tweetId, user_id: currentUserId })
      .then(res => Number(res[0].total) > 0)

    if (checkIfAlreadyLiked === false) throw new GenericError('FORBIDDEN', 'You still do not liked this tweet.');

    try {
      await db.delete()
        .from('tweets_likes')
        .where({
          tweet_id: tweetId,
          user_id: currentUserId,
        })
      
      return 'Done.';
    }
    catch(err) {
      throw new GenericError('UNKNOWN', 'There was a problem liking this tweet.');
    }
  }
}

export default LikesResolvers