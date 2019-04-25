import * as express from 'express'
import * as graphqlMiddleware from 'express-graphql'
import expressPlayground from 'graphql-playground-middleware-express'
import queryComplexity, { simpleEstimator, fieldConfigEstimator } from 'graphql-query-complexity'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import * as path from 'path'
import GenericError from './src/GenericError';

const DEV = process.env.NODE_ENV !== 'production'
const PORT = 8000

import resolvers from './src/resolvers'

void (async function bootstrap() {
  const server = express()

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, 'schema.graphql'),
  })

  // Create GraphQL server
  server.post('/graphql', graphqlMiddleware((req, res, params) => ({
    schema,
    debug: true, // (DEV === true)
    customFormatErrorFn: ({ message, originalError, ...err}) => ({
      code: !(originalError && originalError.code) ? 'UNKNOWN' : originalError.code,
      message,
      ...err,
      stack: originalError && originalError.stack,
    }),
    validationRules: [
      // See more: https://github.com/slicknode/graphql-query-complexity
      queryComplexity({
        maximumComplexity: 25,
        variables: params!.variables,
        estimators: [
          fieldConfigEstimator(),
          simpleEstimator({ defaultComplexity: 0 })
        ],
        // @ts-ignore
        createError(max: number, actual: number) {
          return new GenericError('QUERY_TOO_COMPLEX', `The query exceeds the maximum complexity of ${max}. Actual complexity is ${actual}`);
        }
      })
    ]
  })))
  // Enable playground
  server.get('/graphql', expressPlayground({ endpoint: '/graphql' }))

  // Start the server
  server.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`🚀  Server is running! GraphQL Playground available at http://localhost:${PORT}/graphql`)
  })
})()