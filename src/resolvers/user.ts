import { Resolver, Query, Mutation, Arg, Args, Authorized, Ctx } from "type-graphql";
import PaginationArgs from "../args&inputs/pagination.args";
import { PaginatedUserResponse } from "../paginatedResponse";
import NewUserInput from "../args&inputs/newUser.input";
import GenericError from "../genericError";
import User from "../models/user";
import { Context } from '../../types'
import { encode, decode } from '../../utils'
import db from '../../database'

// Do not order all columns for security reasons
export const userColumns = ['id', 'name', 'email', 'role']

@Resolver(of => User)
class UserResolver {
  
  @Query(returns => User, { description: 'Get the currently authenticated user.', complexity: 1 })
  async me(@Ctx() { currentUserId }: Context ): Promise<User> {
    if (typeof currentUserId === 'undefined' || currentUserId === null) throw new GenericError('NOT_AUTHENTICATED');

    return await db.select(userColumns).from('users').where({ id: currentUserId }).first() as User; 
  }


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


  @Query(returns => PaginatedUserResponse, { description: 'Search users.', complexity: 6 })
  async users(
    @Args() { first, offset, after }: PaginationArgs
  ): Promise<PaginatedUserResponse> {
    let query = [`SELECT * FROM (
      SELECT "${userColumns.join('", "')}", ROW_NUMBER() OVER (ORDER BY id) FROM "users"
    ) AS X`]
    let paginationStyle: 'cursor' | 'offset'

    // Cursor-based pagination
    if (typeof after !== 'undefined') {
      query.push(`WHERE "id" > ${decode(after)}`)
      paginationStyle = 'cursor'
    }

    query.push('ORDER BY id ASC') // Mais recentes primeiro

    query.push(`LIMIT ${first}`) // Limite de itens na resposta

    // Offset-based pagination
    if (typeof offset !== 'undefined' && paginationStyle !== 'cursor') {
      query.push(`OFFSET ${offset}`)
      paginationStyle = 'offset'
    }

    let items: Array<User & { row_number: string, cursor: string }>
    try {
      items = await db.raw(query.join(' ')).then(res => {
        return res.rows.map(item => ({ ...item, cursor: encode(item.id) }))
      })
    } catch (err) {
      throw new GenericError('UNKNOWN', 'There was a problem fetching the elements.');
    }

    const totalCount: number = await db.table('users').count('* as total').then(r => r[0].total)
    const hasAtLeast1Item = (items.length >= 1)
    const lastItem = items[items.length-1], firstItem = items[0]

    return {
      items,
      totalCount,
      pageInfo: {
        size: Math.min(first, items.length),
        hasPreviousPage: (Number(firstItem.row_number) > 1),
        hasNextPage: (Number(lastItem.row_number) < totalCount),
        startCursor: hasAtLeast1Item ? encode(firstItem.id) : null,
        endCursor: hasAtLeast1Item ? encode(lastItem.id) : null,
      },
      paginationStyle,
    };
  }


  @Mutation(returns => User, { description: 'Create a new user in the database.', complexity: 1 })
  async createUser(
    @Arg('input') input: NewUserInput
  ): Promise<User> {
    return await db.insert(input).into('users').returning(userColumns)
      .then(res => (res[0] as User))
      .catch(err => {
        const emailAlreadyExists = err.message.includes('duplicate key value violates unique constraint "users_email_unique"')

        if (emailAlreadyExists) throw new GenericError('FORBIDDEN', 'Email already registered.')
        else throw err
      });
  }


  @Authorized(['admin'])
  @Mutation(returns => String, { description: 'Delete user by id from database', complexity: 1 })
  async deleteUser(
    @Arg('id') id: string,
  ): Promise<string> {
    const result = await db.table('users').delete().where({ id })

    if (result === 0) throw new GenericError('NOT_FOUND', 'No users with this id were found.');

    return `Done!`
  }
}

export default UserResolver