/**
 * @param {Object} knex
 * @param {import('knex').SchemaBuilder} knex.schema
 */
exports.up = function (knex) {
    return knex.schema.createTable('tweets_likes', (table) => {
        table.increments('id').unsigned().primary();
        table.integer('user_id')
            .references('id')
            .inTable('users')
            .onDelete('CASCADE')
            .notNullable();
        table.integer('tweet_id')
            .references('id')
            .inTable('tweets')
            .onDelete('CASCADE')
            .notNullable();
        table.dateTime('created_at').notNullable();
    });
};
exports.down = function (knex) {
    return knex.schema.dropTable('tweets_likes');
};
