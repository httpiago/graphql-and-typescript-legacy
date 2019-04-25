import { Resolver, Query, Arg, Args } from "type-graphql";
import PaginationArgs from "../Args&Inputs/pagination.args";
import { PaginatedUserResponse } from "./PaginatedResponse";
import GenericError from "../GenericError";
import User from "../models/user";
import db from '../../database'

// Do not order all columns for security reasons
const userColumns = ['id', 'name', 'email', 'role']

@Resolver(of => User)
class UserResolver {

  @Query(returns => User, { description: 'Find specific user by id.', complexity: 1 })
  async user(
    @Arg('id') id: number
  ): Promise<User> {
    const result = await db.select(userColumns).from('users').where({ id })

    if (result.length <= 0) {
      throw new GenericError('NOT_FOUND', 'No users with this id were found.');
    }
    else return result[0];
  }


  @Query(returns => PaginatedUserResponse, { description: 'Search users.', complexity: 4 })
  async users(
    @Args() { limit, offset }: PaginationArgs
  ): Promise<PaginatedUserResponse> {
    const items = await db.table('users').select(userColumns).limit(limit).offset(offset) as Array<User>
    const hasAtLeast1Item = (items.length >= 1)
    const total = await db.table('users').count('* as total').then(r => r[0].total) as number

    return {
      items,
      total,
      pageInfo: {
        size: Math.min(limit, items.length),
        hasPreviousPage: (offset !== 0),
        hasNextPage: (offset + limit < total),
        startCursor: hasAtLeast1Item ? items[0].id : '',
        endCursor: hasAtLeast1Item ? items[items.length-1].id : ''
      }
    }
  }
}

export default UserResolver