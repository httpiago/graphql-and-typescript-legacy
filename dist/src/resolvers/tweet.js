"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const paginatedResponse_1 = require("../paginatedResponse");
const pagination_args_1 = require("../args&inputs/pagination.args");
const utils_1 = require("../../utils");
const tweet_1 = require("../models/tweet");
const user_1 = require("../models/user");
const database_1 = require("../../database");
const user_2 = require("./user");
const newTweet_input_1 = require("../args&inputs/newTweet.input");
const genericError_1 = require("../genericError");
let TweetResolvers = class TweetResolvers {
    author({ user_id }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield database_1.default.select(user_2.userColumns).from('users').where({ id: user_id }).first();
        });
    }
    replyTweet({ reply_to }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (reply_to === null)
                return;
            else {
                return yield database_1.default.select('*').from('tweets').where({ id: reply_to }).first();
            }
        });
    }
    replies(originalTweet, { first, offset, after }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils_1.getPaginatedRowsFromTable({
                tableName: 'tweets',
                columns: '*',
                where: [`"reply_to" = ${originalTweet.id}`],
                after,
                first,
                offset,
            });
        });
    }
    likesCount(tweetInfos) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.select('*')
                    .from('tweets')
                    .innerJoin('tweets_likes', 'tweets.id', '=', 'tweets_likes.tweet_id')
                    .where('tweets.id', '=', tweetInfos.id)
                    .then(res => res.length || 0);
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem counting the total number of likes.');
            }
        });
    }
    repliesCount(tweetInfos) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.select('*')
                    .from('tweets')
                    .where('reply_to', '=', tweetInfos.id)
                    .then(res => res.length || 0);
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem counting the total number of replies.');
            }
        });
    }
    peopleWhoLiked(tweetInfos) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield database_1.default.select(user_2.userColumns.map(c => `users.${c}`))
                    .from('users')
                    .innerJoin('tweets_likes', 'users.id', '=', 'tweets_likes.user_id')
                    .where('tweet_id', '=', tweetInfos.id);
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem fetching users who liked this tweet.');
            }
        });
    }
    viewerHasLiked(tweetInfos, { currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            // If no user is logged in, return false
            if (currentUserId === null)
                return false;
            try {
                return yield database_1.default.count('*')
                    .from('tweets_likes')
                    .where('tweet_id', '=', tweetInfos.id)
                    .andWhere('user_id', '=', currentUserId)
                    .then(res => Number(res[0].count) > 0);
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem determining whether or not the current user has liked the tweet.');
            }
        });
    }
    tweet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const tweet = yield database_1.default.select('*').from('tweets').where({ id }).first();
            return tweet;
        });
    }
    tweets({ first, offset, after }, fromUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils_1.getPaginatedRowsFromTable(Object.assign({ tableName: 'tweets', columns: '*' }, (typeof fromUser !== 'undefined' ? {
                where: [`"user_id" = ${fromUser}`]
            } : {}), { after,
                first,
                offset }));
        });
    }
    thread({ first, offset, after }, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils_1.getPaginatedRowsFromTable(Object.assign({ tableName: 'tweets', columns: '*' }, (typeof id !== 'undefined' ? {
                where: [`"reply_to" = ${id}`]
            } : {}), { after,
                first,
                offset }));
        });
    }
    createTweet(input, { currentUserId }, pubSub) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTweet = yield database_1.default.insert(Object.assign({}, input, { user_id: currentUserId, created_at: new Date().toISOString() }))
                .into('tweets')
                .returning('*')
                .then(res => res[0]);
            const topicName = (typeof input.reply_to === 'undefined' || input.reply_to === null) ? 'NEW_TWEET' : 'NEW_REPLY';
            yield pubSub.publish(topicName, newTweet);
            return newTweet;
        });
    }
    deleteTweet(id, { currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const tweet = yield database_1.default.select('*').from('tweets').where({ id }).first();
            if (typeof tweet === 'undefined')
                throw new genericError_1.default('NOT_FOUND', 'No tweets with this id were found.');
            if (currentUserId != tweet.user_id)
                throw new genericError_1.default('FORBIDDEN', 'You are not allowed to perform this action!');
            // Delete tweet
            const result = yield database_1.default.delete().from('tweets').where({ id });
            if (result === 0)
                throw new genericError_1.default('UNKNOWN', 'There was a problem deleting Tweet.');
            return `Done.`;
        });
    }
    tweetAdded(newTweetPayload, fromUser) {
        return __awaiter(this, void 0, void 0, function* () {
            return newTweetPayload;
        });
    }
    replyAdded(newTweetPayload, repliesTo) {
        return __awaiter(this, void 0, void 0, function* () {
            return newTweetPayload;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(returns => user_1.default, { description: 'The actor who authored the Tweet.', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "author", null);
__decorate([
    type_graphql_1.FieldResolver(returns => tweet_1.default, { nullable: true, description: 'The original tweet associated with this node.', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "replyTweet", null);
__decorate([
    type_graphql_1.FieldResolver(returns => paginatedResponse_1.TweetConnection, { description: 'Get all tweets that are marked as a response from a specific tweet.', complexity: 10 }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default,
        pagination_args_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "replies", null);
__decorate([
    type_graphql_1.FieldResolver(returns => Number, { description: 'Count how many likes a tweet has.', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "likesCount", null);
__decorate([
    type_graphql_1.FieldResolver(returns => Number, { description: 'Count how many replies a tweet has.', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "repliesCount", null);
__decorate([
    type_graphql_1.FieldResolver(returns => [user_1.default], { description: 'A list of users who have liked the tweet', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "peopleWhoLiked", null);
__decorate([
    type_graphql_1.FieldResolver(returns => Boolean, { description: 'Whether or not the authenticated user has liked the tweet.', complexity: 4 }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default, Object]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "viewerHasLiked", null);
__decorate([
    type_graphql_1.Query(returns => tweet_1.default, { description: 'Get a specific tweet by id.', complexity: 1 }),
    __param(0, type_graphql_1.Arg('id', type => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "tweet", null);
__decorate([
    type_graphql_1.Query(returns => paginatedResponse_1.TweetConnection, { description: 'Search latest tweets.', complexity: 10 }),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Arg('fromUser', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_args_1.default, String]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "tweets", null);
__decorate([
    type_graphql_1.Query(returns => paginatedResponse_1.TweetConnection, { description: 'Search for replies to a specific tweet.', complexity: 10 }),
    __param(0, type_graphql_1.Args()),
    __param(1, type_graphql_1.Arg('id', type => type_graphql_1.ID, { description: 'Id of the original tweet.' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_args_1.default, String]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "thread", null);
__decorate([
    type_graphql_1.Authorized(['admin', 'user']),
    type_graphql_1.Mutation(returns => tweet_1.default, { description: 'Create a new tweet.', complexity: 5 }),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __param(2, type_graphql_1.PubSub()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [newTweet_input_1.default, Object, type_graphql_1.PubSubEngine]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "createTweet", null);
__decorate([
    type_graphql_1.Authorized(['admin', 'user']),
    type_graphql_1.Mutation(returns => String, { description: 'Delete tweet by id. Returns "Done." if successful.', complexity: 5 }),
    __param(0, type_graphql_1.Arg('id', type => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "deleteTweet", null);
__decorate([
    type_graphql_1.Subscription(returns => tweet_1.default, {
        description: 'Listen for new tweets.',
        topics: 'NEW_TWEET',
        filter: ({ args, payload }) => {
            // If "fromUser" is set, filter by user id in tweets
            if (typeof args.fromUser !== 'undefined')
                return payload.user_id == args.fromUser;
            else
                return true;
        },
        complexity: 30
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg('fromUser', type => type_graphql_1.ID, { nullable: true, description: 'The Node ID of the user.' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default, String]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "tweetAdded", null);
__decorate([
    type_graphql_1.Subscription(returns => tweet_1.default, {
        description: 'Listen for new replies to a specific tweet.',
        topics: 'NEW_REPLY',
        filter: ({ args, payload }) => {
            // Filter by reply_to in tweet
            return payload.reply_to == args.toTweet;
        },
        complexity: 30
    }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Arg('toTweet', type => type_graphql_1.ID, { description: 'The Node ID of the original tweet.' })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tweet_1.default, String]),
    __metadata("design:returntype", Promise)
], TweetResolvers.prototype, "replyAdded", null);
TweetResolvers = __decorate([
    type_graphql_1.Resolver(of => tweet_1.default)
], TweetResolvers);
exports.default = TweetResolvers;
