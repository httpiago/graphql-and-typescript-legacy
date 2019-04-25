import * as knex from 'knex'
const configs = require('../knexfile.js')
const environment = process.env.ENVIRONMENT || 'development'

/**
 * Query database.
 * @see https://knexjs.org/
 */
const db = knex(configs[environment])

export default db