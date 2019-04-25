module.exports = {

  development: {
    client: 'pg',
    connection: {
      host:     '127.0.0.1',
      user:     'root',
      password: '1234',
      database: 'graphql-server-with-typescript',
      charset:  'utf8'
    },
    debug: false,
    migrations: {
      directory: __dirname + '/database/migrations',
    },
    seeds: {
      directory: __dirname + '/database/seeds'
    },
  },

  production: {
    client: 'pg',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password',
      charset:  'utf8'
    },
    migrations: {
      directory: __dirname + '/database/migrations',
    },
    seeds: {
      directory: __dirname + '/database/seeds'
    },
  }

};
