/**
 * @param {Object} knex
 * @param {import('knex').SchemaBuilder} knex.schema
 */
exports.up = function(knex) {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').unsigned().primary();
    table.string('user_id').nullable();
    table.string('token').notNullable();
    table.enum('type', ['login-code', 'jwt']).notNullable();
    table.string('expires_in').notNullable()
    table.dateTime('created_at').notNullable()
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tokens')
};
