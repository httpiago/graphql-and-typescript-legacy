/**
 * @param {Object} knex
 * @param {import('knex').SchemaBuilder} knex.schema
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNull();
    table.string('email').notNull().unique();
    table.enum('role', ['admin', 'writer', 'reader']).notNull().defaultTo('reader');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users')
};
