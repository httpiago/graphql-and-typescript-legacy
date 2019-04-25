import * as express from 'express'
import * as graphqlMiddleware from 'express-graphql'
import expressPlayground from 'graphql-playground-middleware-express'
import { buildSchema } from 'type-graphql'
import 'reflect-metadata'
import * as path from 'path'

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
  })))
  // Enable playground
  server.get('/graphql', expressPlayground({ endpoint: '/graphql' }))

  // Start the server
  server.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`🚀  Server is running! GraphQL Playground available at http://localhost:${PORT}/graphql`)
  })
})()