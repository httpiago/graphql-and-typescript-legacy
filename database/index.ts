import * as knex from 'knex'
const configs = require('../knexfile')['production']

/**
 * Query database.
 * @see https://knexjs.org/
 */
const db = knex(configs)

export default db