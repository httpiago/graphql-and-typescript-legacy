/**
 * @param {Object} knex
 * @param {import('knex').SchemaBuilder} knex.schema
 */
exports.up = function(knex) {
  return knex.schema.createTable('tweets', (table) => {
    table.increments('id').unsigned().primary();
    table.string('content', 140).notNullable();
    table.integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .notNullable();
    table.integer('reply_to')
      .references('id')
      .inTable('tweets')
      .nullable()
      .defaultTo(null);
    table.dateTime('created_at').notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('tweets')
};
