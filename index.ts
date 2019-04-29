import * as express from 'express'
import { ApolloServer } from 'apollo-server-express'
import * as bodyParser from 'body-parser'
import * as helmet from 'helmet'
import * as rateLimit from 'express-rate-limit'
import queryComplexity, { simpleEstimator, fieldConfigEstimator } from 'graphql-query-complexity'
import { buildSchema } from 'type-graphql'
import importsToArray from 'import-to-array'
import 'reflect-metadata'
import * as path from 'path'
import routes from './routes'
import GenericError from './src/genericError'
import authChecker from './src/authChecker'
import { parseRequestToken } from './utils';
require('dotenv').config()

const DEV = process.env.NODE_ENV !== 'production'
const PORT = process.env.PORT || 8000

import * as resolvers from './src/resolvers'

void (async function bootstrap() {
  const server = express()

  server.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  server.use(rateLimit({
    windowMs: (5) * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again after a few minutes.',
  }))
  server.use(helmet({
    // See more: https://content-security-policy.com/
    // contentSecurityPolicy: { directives: {
    //   defaultSrc: ["'self'"],
    //   scriptSrc: ["'self'"],
    //   styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    //   imgSrc: ["'self'", 'data:', '*'],
    //   connectSrc: ["'self'"]
    // }},
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' }
  }))
  server.use(bodyParser.urlencoded({ extended: false }))
  server.use(bodyParser.json())
  server.use(express.json())
  // Define others server routes
  server.use(routes)

  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    // @ts-ignore
    resolvers: importsToArray(resolvers),
    authChecker,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, 'schema.graphql'),
  })

  // Create GraphQL server
  new ApolloServer({
    schema,
    playground: true, // (DEV === true)
    debug: true, // (DEV === true)
    context({ req }) {
      const decoded = parseRequestToken(req)
      return {
        currentUserId: (decoded !== null) ? decoded.user_id : null,
      }
    },
    validationRules: [
      // See more: https://github.com/slicknode/graphql-query-complexity
      queryComplexity({
        maximumComplexity: 30,
        estimators: [
          fieldConfigEstimator(),
          simpleEstimator({ defaultComplexity: 0 })
        ],
        // @ts-ignore
        createError(max: number, actual: number) {
          return new GenericError('QUERY_TOO_COMPLEX', `The query exceeds the maximum complexity of ${max}. Actual complexity is ${actual}`);
        }
      })
    ],
    formatError({ originalError, ...error }) {
      return {
        // @ts-ignore
        code: !(originalError.code) ? 'UNKNOWN' : originalError.code,
        ...error
      }
    }
  })
  .applyMiddleware({ app: server })

  // Start the server
  server.listen(PORT, (err) => {
    if (err) throw err;
    else console.log(`🚀  Server is running! GraphQL Playground available at http://localhost:${process.env.PORT}/graphql`)
  })
})()