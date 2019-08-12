# graphql-and-typescript

The name is self explanatory. A simple server that creates a [GraphQL](https://graphql.org) api using:

- [typescript](http://typescriptlang.org) to code type-safety.
- [type-graphql](https://typegraphql.ml/) to create the GraphQL schema and resolvers using decorators and classes to avoid the fatigue of writing graphql schema separate of code typing. (**Highly recommended to learn!**)
- [apollo](https://www.apollographql.com/docs/apollo-server/) the engine that will execute the queries.
- [knexjs](https://knexjs.org) to query and manage versions of the database.

## Conclusion

This repository served to test if the [type-graphql](https://typegraphql.ml/) package was good enough for production use and I was pleased with the result, but now I found some problems looking at the code:
 - Decorators are not a standard yet.
 - The code gets more verbose and difficult for other developers to maintain.
 - The package in question still needs to be improved.

Anyway, [I'm testing another approach now](https://github.com/httpiago/graphql-server-with-typescript).

## Installation

```bash
git clone https://github.com/httpiago/graphql-and-typescript-legacy.git
cd graphql-and-typescript-legacy
yarn install
```

## Commands

- **`yarn run watch`**: Start the server with live-reloading using [ts-node-dev](https://www.npmjs.com/package/ts-node-dev).
- **`yarn run debug`**: Start the server using [ts-node-dev](https://www.npmjs.com/package/ts-node-dev) in debug mode to be attached by VS Code debugger.
- **`yarn run build-ts`**: Compile all files in the dist folder.
- **`yarn run start`**: Run the codes compiled by the "build-ts" command.
- **`yar run deploy`**: It executes the "build-ts" command and sends the files to the remote branch "heroku" which consequently trigger a new build in Heroku.

## Security mechanisms

This server contains some security checks to prevent malicious queries and abuse, for example:

### Query complexity limit
All queries, mutations, and fields in this api contain a cost value and before the query is actually executed, it is summed and checked if its exceeded the defined limit. [See implementation](https://github.com/httpiago/graphql-and-typescript-legacy/blob/master/index.ts#L81).

### Query depth limit
There is a limit to how depth a query can be and if is greater than the limit, the request will be rejected. Example: If you run `query { tweets(first: 10) { edges { node { content } } } }`, the depth of this query is 3. [See implementation](https://github.com/httpiago/graphql-and-typescript-legacy/blob/master/index.ts#L79).

### Login authorization
All mutations require a jwt token to determine which user is trying to execute the query and to acquire that token, it is necessary to complete the normal login flow.

### Rate-limit
A basic package was installed to limit the number of requests to the server and thus to avoid DDoS attacks. [See implementation](https://github.com/httpiago/graphql-and-typescript-legacy/blob/master/index.ts#L30).

> Of course, only these security barriers will not be enough to prevent attacks in production but it is enough to prevent errors from the developers working on the project. A good tip is to implement a cost limit system, [just as GitHub does with its api in Graphql](https://developer.github.com/v4/guides/resource-limitations/#rate-limit).

## Some examples of queries

```graphql
query getLatestTweets {
  tweets(first: 20) {
    edges {
      tweet: node {
        id
        content
        created_at

        author {
          name
        }
      }
      cursor
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
```

```graphql
query getSpecificUserData {
  user(id: "7") {
    id
    name
    email
  }
}
```

```graphql
mutation {
  createTweet(
    input: { content: "Just testing" }
  ) {
    id
  }
}
```

```graphql
subscription listenForNewTweets {
  tweetAdded {
    id
    content
    created_at

    author {
      name
      email
    }
  }
}
```
