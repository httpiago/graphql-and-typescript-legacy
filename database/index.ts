import * as knex from 'knex'
require('dotenv').config()

/**
 * Query database.
 * @see https://knexjs.org/
 */
const db = knex({
  client: process.env.DB_DIALECT,
  connection: {
    
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset:  'utf8'
  },
  debug: false,
  migrations: {
    directory: __dirname + '/database/migrations',
  },
  seeds: {
    directory: __dirname + '/database/seeds'
  },
})

export default db