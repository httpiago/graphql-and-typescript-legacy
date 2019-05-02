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
const database_1 = require("../../database");
const genericError_1 = require("../genericError");
let LikesResolvers = class LikesResolvers {
    addLike(tweetId, { currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkTweetExist = yield database_1.default.select('*')
                .from('tweets')
                .where({ id: tweetId })
                .first()
                .then(res => typeof res !== 'undefined');
            if (checkTweetExist === false)
                throw new genericError_1.default('NOT_FOUND', 'No tweet with this id were found.');
            const checkIfAlreadyLiked = yield database_1.default.count('* as total')
                .from('tweets_likes')
                .where({ tweet_id: tweetId, user_id: currentUserId })
                .then(res => Number(res[0].total) > 0);
            if (checkIfAlreadyLiked === true)
                throw new genericError_1.default('FORBIDDEN', 'You already liked this tweet.');
            try {
                yield database_1.default.insert({
                    tweet_id: tweetId,
                    user_id: currentUserId,
                    created_at: new Date().toISOString()
                })
                    .into('tweets_likes');
                return 'Done.';
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem liking this tweet.');
            }
        });
    }
    removeLike(tweetId, { currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkTweetExist = yield database_1.default.select('*')
                .from('tweets')
                .where({ id: tweetId })
                .first()
                .then(res => typeof res !== 'undefined');
            if (checkTweetExist === false)
                throw new genericError_1.default('NOT_FOUND', 'No tweet with this id were found.');
            const checkIfAlreadyLiked = yield database_1.default.count('* as total')
                .from('tweets_likes')
                .where({ tweet_id: tweetId, user_id: currentUserId })
                .then(res => Number(res[0].total) > 0);
            if (checkIfAlreadyLiked === false)
                throw new genericError_1.default('FORBIDDEN', 'You still do not liked this tweet.');
            try {
                yield database_1.default.delete()
                    .from('tweets_likes')
                    .where({
                    tweet_id: tweetId,
                    user_id: currentUserId,
                });
                return 'Done.';
            }
            catch (err) {
                throw new genericError_1.default('UNKNOWN', 'There was a problem liking this tweet.');
            }
        });
    }
};
__decorate([
    type_graphql_1.Authorized(),
    type_graphql_1.Mutation(returns => String, { description: 'Add a like to a tweet by id. Returns "Done." if successful.', complexity: 10 }),
    __param(0, type_graphql_1.Arg('tweetId', type => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LikesResolvers.prototype, "addLike", null);
__decorate([
    type_graphql_1.Mutation(returns => String, { description: 'Remove like from a tweet by id. Returns "Done." if successful.', complexity: 10 }),
    __param(0, type_graphql_1.Arg('tweetId', type => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LikesResolvers.prototype, "removeLike", null);
LikesResolvers = __decorate([
    type_graphql_1.Resolver()
], LikesResolvers);
exports.default = LikesResolvers;
