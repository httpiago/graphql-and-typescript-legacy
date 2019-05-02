"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = require("http");
const graphql_1 = require("graphql");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const graphql_query_complexity_1 = require("graphql-query-complexity");
const depthLimit = require("graphql-depth-limit");
const type_graphql_1 = require("type-graphql");
const subscriptions_transport_ws_1 = require("subscriptions-transport-ws");
const import_to_array_1 = require("import-to-array");
require("reflect-metadata");
const path = require("path");
const routes_1 = require("./routes");
const genericError_1 = require("./src/genericError");
const authChecker_1 = require("./src/authChecker");
const utils_1 = require("./utils");
require('dotenv').config();
const DEV = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 8000;
const resolvers = require("./src/resolvers");
void (function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        app.enable("trust proxy"); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
        app.use(rateLimit({
            windowMs: (5) * 60 * 1000,
            max: 100,
            message: 'Too many requests, please try again after a few minutes.',
        }));
        app.use(helmet({
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
        }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(express.json());
        // Define others server routes
        app.use(routes_1.default);
        // build TypeGraphQL executable schema
        const schema = yield type_graphql_1.buildSchema({
            // @ts-ignore
            resolvers: import_to_array_1.default(resolvers),
            authChecker: authChecker_1.default,
            // automatically create `schema.gql` file with schema definition in current folder
            emitSchemaFile: path.resolve(__dirname, 'schema.graphql'),
        });
        // Create GraphQL server
        new apollo_server_express_1.ApolloServer({
            schema,
            subscriptions: '/graphql/subscriptions',
            introspection: true,
            playground: true,
            debug: true,
            context: ({ req }) => __awaiter(this, void 0, void 0, function* () {
                const decoded = yield utils_1.parseRequestToken(req);
                return {
                    currentUserId: (decoded !== null) ? decoded.user_id : null,
                };
            }),
            validationRules: [
                // See more: https://www.npmjs.com/package/graphql-depth-limit
                depthLimit(10),
                // See more: https://github.com/slicknode/graphql-query-complexity
                graphql_query_complexity_1.default({
                    maximumComplexity: 30,
                    estimators: [
                        graphql_query_complexity_1.fieldConfigEstimator(),
                        graphql_query_complexity_1.simpleEstimator({ defaultComplexity: 0 })
                    ],
                    // @ts-ignore
                    createError(max, actual) {
                        return new genericError_1.default('QUERY_TOO_COMPLEX', `The query exceeds the maximum complexity of ${max}. Actual complexity is ${actual}`);
                    }
                })
            ],
            formatError(_a) {
                var { originalError } = _a, error = __rest(_a, ["originalError"]);
                return Object.assign({ 
                    // @ts-ignore
                    code: (originalError && 'code' in originalError) ? originalError.code : 'UNKNOWN' }, error);
            }
        })
            .applyMiddleware({ app });
        const server = http_1.createServer(app);
        // Start the server
        server.listen(PORT, () => {
            new subscriptions_transport_ws_1.SubscriptionServer({
                schema, execute: graphql_1.execute, subscribe: graphql_1.subscribe,
            }, {
                server, path: '/graphql/subscriptions',
            });
            console.log(`🚀  Server is running! GraphQL Playground available at http://localhost:${process.env.PORT}/graphql`);
        });
    });
})();
