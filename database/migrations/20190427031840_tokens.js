/**
 * @param {Object} knex
 * @param {import('knex').SchemaBuilder} knex.schema
 */
exports.up = function(knex) {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').unsigned().primary();
    table.string('user_id').nullable();
    table.string('token').notNull();
    table.enum('type', ['login-code', 'jwt']).notNull();
    table.string('expires_in').notNull()
    table.dateTime('created_at').notNull()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tokens')
};
