import { Request } from 'express';
import * as jwt from 'jwt-simple'
import { isAfter } from 'date-fns';
import GenericError from './src/genericError';
import db from './database';
import User from './src/models/user';

/**
 * Encode a string to base64 (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
export function encode(text: string | number) {
  return Buffer.from(String(text)).toString('base64');
}

type Base64String = string;

/**
 * Decode a base64 string (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
export function decode(encodedText: Base64String) {
  return Buffer.from(encodedText, 'base64').toString('ascii');
}

export function parseRequestToken({ headers }: Request): { [index: string]: any } | null {
  if (typeof headers === 'undefined' || typeof headers.authorization === 'undefined') return null

  const token = headers.authorization.split(' ')
  // Checar se o token é válido
  if (token.length !== 2 || token[0] !== 'Bearer') throw new Error('Invalid token. Format is Authorization: Bearer [token]');

  const decoded = jwt.decode(token[1], process.env.JWT_SECRET)

  if (isAfter(Date.now(), decoded.exp)) throw new Error('The token has expired.');

  return decoded || null;
}

type Configs = {
  tableName: string,
  columns: string[] | string,
  after?: string,
  first?: number,
  offset?: number,
  where?: string[]
}
/**
 * Search for rows in a table using pagination and return the result expected by Graphql schema.
 */
export async function getPaginatedRowsFromTable<ModelType>({
  columns,
  tableName,
  after,
  offset,
  first,
  where
}: Configs) {
  const cols = typeof columns === 'string' ? columns : `"${columns.join('", "')}"`
  let query = [`SELECT * FROM (
    SELECT ${cols}, ROW_NUMBER() OVER (ORDER BY id) FROM "${tableName}"
  ) AS X`]

  // Cursor-based pagination
  if (typeof after !== 'undefined') {
    query.push(`WHERE "id" > ${decode(after)}`)
  }

  // Add additional filters to query
  if (typeof where !== 'undefined') {
    if (!after) {
      query.push('WHERE ' + where.join(' AND '))  
    } else {
      query.push('AND ' + where.join(' AND '))
    }
  }

  query.push('ORDER BY id ASC') // Newest first

  query.push(`LIMIT ${first}`)

  // Offset-based pagination
  if (typeof offset !== 'undefined' && typeof after === 'undefined') {
    query.push(`OFFSET ${offset}`)
  }

  let result: Array<ModelType & { id: number, row_number: number }>
  try {
    // RUN QUERY
    result = await db.raw(query.join(' ')).then(res => res.rows)
  } catch (err) {
    throw new GenericError('UNKNOWN', 'There was a problem fetching the elements.');
  }

  // Get the total rows in the table
  const totalCount: number = await db.table(tableName).count('* as total').then(r => r[0].total)

  const hasAtLeast1Item = (result.length >= 1)
  const lastItem = result[result.length-1], firstItem = result[0]

  return {
    edges: result.map(item => ({
      node: item,
      cursor: encode(item.id)
    })),
    nodes: result,
    totalCount,
    pageInfo: {
      size: Math.min(first, result.length),
      hasPreviousPage: hasAtLeast1Item ? (Number(firstItem.row_number) > 1) : null,
      hasNextPage: hasAtLeast1Item ? (Number(lastItem.row_number) < totalCount) : null,
      startCursor: hasAtLeast1Item ? encode(firstItem.id) : null,
      endCursor: hasAtLeast1Item ? encode(lastItem.id) : null,
    },
    paginationStyle: after ? 'cursor' : offset ? 'offset' : null,
  };
}