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
const type_graphql_1 = require("type-graphql");
const pagination_args_1 = require("../args&inputs/pagination.args");
const paginatedResponse_1 = require("../paginatedResponse");
const genericError_1 = require("../genericError");
const user_1 = require("../models/user");
const utils_1 = require("../../utils");
const database_1 = require("../../database");
const updateUser_input_1 = require("../args&inputs/updateUser.input");
// Do not order all columns for security reasons
exports.userColumns = ['id', 'name', 'email', 'role'];
let UserResolver = class UserResolver {
    tweets(userInfos, { first, offset, after }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils_1.getPaginatedRowsFromTable({
                tableName: 'tweets',
                columns: '*',
                where: [`"user_id" = ${userInfos.id}`],
                after,
                first,
                offset,
            });
        });
    }
    me({ currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof currentUserId === 'undefined' || currentUserId === null)
                throw new genericError_1.default('NOT_AUTHENTICATED');
            return yield database_1.default.select(exports.userColumns).from('users').where({ id: currentUserId }).first();
        });
    }
    user(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.select(exports.userColumns).from('users').where({ id });
            if (result.length <= 0) {
                throw new genericError_1.default('NOT_FOUND', 'No users with this id were found.');
            }
            else
                return result[0];
        });
    }
    users({ first, offset, after }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield utils_1.getPaginatedRowsFromTable({
                tableName: 'users',
                columns: exports.userColumns,
                after,
                first,
                offset,
            });
        });
    }
    updateMe(_a, { currentUserId }) {
        var { role } = _a, input = __rest(_a, ["role"]);
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.table('users')
                .update(Object.assign({}, input, (typeof role !== 'undefined' ? { role: updateUser_input_1.Role[role] } : {})))
                .where({ id: currentUserId });
            if (result === 0)
                throw new genericError_1.default('NOT_FOUND', 'Could not update you.');
            return `Done.`;
        });
    }
    createUser() {
        return __awaiter(this, void 0, void 0, function* () {
            return 'Deprecated! Use the normal login flow.';
        });
    }
    deleteMe({ currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.delete()
                .from('users')
                .where({ id: currentUserId });
            if (result === 0)
                throw new genericError_1.default('NOT_FOUND', 'Could not delete you.');
            return `Done.`;
        });
    }
    // Deprecate!
    deleteUserById(id, { currentUserId }) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield database_1.default.delete().from('users').where({ id });
            if (result === 0)
                throw new genericError_1.default('NOT_FOUND', 'No users with this id were found.');
            return `Done.`;
        });
    }
};
__decorate([
    type_graphql_1.FieldResolver(returns => paginatedResponse_1.TweetConnection, { description: 'Search for user tweets.', complexity: 10 }),
    __param(0, type_graphql_1.Root()),
    __param(1, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_1.default,
        pagination_args_1.default]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "tweets", null);
__decorate([
    type_graphql_1.Query(returns => user_1.default, { description: 'Get the currently authenticated user.', complexity: 1 }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    type_graphql_1.Query(returns => user_1.default, { description: 'Find specific user by id.', complexity: 1 }),
    __param(0, type_graphql_1.Arg('id', type => type_graphql_1.ID)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "user", null);
__decorate([
    type_graphql_1.Query(returns => paginatedResponse_1.UserConnection, { description: 'Search users.', complexity: 6 }),
    __param(0, type_graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_args_1.default]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    type_graphql_1.Authorized(),
    type_graphql_1.Mutation(returns => String, { description: 'Update infos of current user. Returns "Done." if successful.', complexity: 1 }),
    __param(0, type_graphql_1.Arg('input')),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateUser_input_1.default, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateMe", null);
__decorate([
    type_graphql_1.Mutation(returns => String, { deprecationReason: 'This function can not be used anymore. Log in normally to register' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "createUser", null);
__decorate([
    type_graphql_1.Authorized(),
    type_graphql_1.Mutation(returns => String, { description: 'Delete current user from database. Returns "Done." if successful.', complexity: 1 }),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteMe", null);
__decorate([
    type_graphql_1.Authorized(['admin']),
    type_graphql_1.Mutation(returns => String, { description: 'Delete user by id from database. Returns "Done." if successful. [Admin usage only]', complexity: 1 }),
    __param(0, type_graphql_1.Arg('id', type => type_graphql_1.ID)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteUserById", null);
UserResolver = __decorate([
    type_graphql_1.Resolver(of => user_1.default)
], UserResolver);
exports.default = UserResolver;
