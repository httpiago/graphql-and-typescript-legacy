# graphql-server-with-typescript

The name is self explanatory. A simple server that creates a [GraphQL](https://graphql.org) api using:

- [typescript](http://typescriptlang.org)
- [type-graphql](https://typegraphql.ml/) (Highly recommended to learn!)
- [apollo-server](https://www.apollographql.com/docs/apollo-server/)
- [knexjs](https://knexjs.org)

## Installation

```bash
git clone https://github.com/httpiago/graphql-server-with-typescript.git
cd graphql-server-with-typescript
yarn install
```

## Commands

- **`yarn run watch`**: Start the server with [nodemon](http://nodemon.io).
- **`yarn run start`**: Just start the server using [ts-node](https://github.com/TypeStrong/ts-node).

Unfortunately server startup takes a long time 😕 (because of ts-node) but I am seeing how I can improve this 🕵️‍.

## License

MIT