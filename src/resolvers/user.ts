import { Resolver, Query, Mutation, Arg, Args, Authorized, Ctx, FieldResolver, Root } from "type-graphql";
import PaginationArgs from "../args&inputs/pagination.args";
import { UserConnection, TweetConnection } from "../paginatedResponse";
import NewUserInput from "../args&inputs/newUser.input";
import GenericError from "../genericError";
import User from "../models/user";
import { Context } from '../../types'
import { getPaginatedRowsFromTable } from '../../utils'
import db from '../../database'
import Tweet from "../models/tweet";

// Do not order all columns for security reasons
export const userColumns = ['id', 'name', 'email', 'role']

@Resolver(of => User)
class UserResolver {

  @FieldResolver(returns => TweetConnection, { description: 'Search for user tweets.', complexity: 10 })
  async tweets(
    @Root() userInfos: User,
    @Args() { first, offset, after }: PaginationArgs
  ) {
    return await getPaginatedRowsFromTable({
      tableName: 'tweets',
      columns: '*',
      where: [`"user_id" = ${userInfos.id}`],
      after,
      first,
      offset,
    });
  }


  @Query(returns => User, { description: 'Get the currently authenticated user.', complexity: 1 })
  async me(@Ctx() { currentUserId }: Context ): Promise<User> {
    if (typeof currentUserId === 'undefined' || currentUserId === null) throw new GenericError('NOT_AUTHENTICATED');

    return await db.select(userColumns).from('users').where({ id: currentUserId }).first() as User; 
  }


  @Query(returns => User, { description: 'Find specific user by id.', complexity: 1 })
  async user(
    @Arg('id') id: string
  ): Promise<User> {
    const result = await db.select(userColumns).from('users').where({ id })

    if (result.length <= 0) {
      throw new GenericError('NOT_FOUND', 'No users with this id were found.');
    }
    else return result[0];
  }


  @Query(returns => UserConnection, { description: 'Search users.', complexity: 6 })
  async users(
    @Args() { first, offset, after }: PaginationArgs
  ) {
    return await getPaginatedRowsFromTable<User>({
      tableName: 'users',
      columns: userColumns,
      after,
      first,
      offset,
    });
  }


  @Mutation(returns => String, { deprecationReason: 'This function can not be used anymore. Log in normally to register' })
  async createUser(): Promise<string> {
    return 'Deprecated! Use the normal login flow.';
  }


  @Authorized()
  @Mutation(returns => String, { description: 'Delete user by id from database', complexity: 1 })
  async deleteUser(
    @Arg('id') id: string,
    @Ctx() { currentUserId }: Context
  ): Promise<string> {
    if (currentUserId != id) throw new GenericError('FORBIDDEN', 'You are not allowed to perform this action!');

    const result = await db.delete().from('users').where({ id })

    if (result === 0) throw new GenericError('NOT_FOUND', 'No users with this id were found.');

    return `Done!`
  }
}

export default UserResolver