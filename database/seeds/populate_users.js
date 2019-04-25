/** @type {import('faker')} */
const faker = require('faker')

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: 'Iago Bruno', email: 'iagob26@gmail.com', role: 'admin' },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
        { name: faker.name.findName(), email: faker.internet.email() },
      ]);
    });
};
