/** @type {import('faker')} */
const faker = require('faker')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('tweets').del()
    .then(function () {
      // Inserts seed entries
      return knex('tweets').insert([
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), reply_to: 1, user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), reply_to: 1, user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
        { content: faker.lorem.sentence(10), user_id: Math.floor(Math.random() * 10) + 1, created_at: new Date().toISOString() },
      ]);
    });
};
