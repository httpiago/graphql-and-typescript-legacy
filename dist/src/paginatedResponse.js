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
Object.defineProperty(exports, "__esModule", { value: true });
const type_graphql_1 = require("type-graphql");
const user_1 = require("./models/user");
const tweet_1 = require("./models/tweet");
let PageInfo = class PageInfo {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Number)
], PageInfo.prototype, "size", void 0);
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], PageInfo.prototype, "startCursor", void 0);
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], PageInfo.prototype, "endCursor", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], PageInfo.prototype, "hasPreviousPage", void 0);
__decorate([
    type_graphql_1.Field({ nullable: true }),
    __metadata("design:type", Boolean)
], PageInfo.prototype, "hasNextPage", void 0);
PageInfo = __decorate([
    type_graphql_1.ObjectType({ isAbstract: true })
], PageInfo);
function PaginatedResponseGeneric(ItemClass) {
    let Edge = class Edge {
    };
    __decorate([
        type_graphql_1.Field(type => ItemClass, { description: 'The item at the end of the edge.' }),
        __metadata("design:type", Object)
    ], Edge.prototype, "node", void 0);
    __decorate([
        type_graphql_1.Field({ description: 'A cursor for use in pagination.' }),
        __metadata("design:type", String)
    ], Edge.prototype, "cursor", void 0);
    Edge = __decorate([
        type_graphql_1.ObjectType(`${ItemClass.name}Edge`, { isAbstract: true })
    ], Edge);
    let PaginatedResponse = class PaginatedResponse {
    };
    __decorate([
        type_graphql_1.Field({ description: 'Identifies the total count of items in the connection.' }),
        __metadata("design:type", Number)
    ], PaginatedResponse.prototype, "totalCount", void 0);
    __decorate([
        type_graphql_1.Field(type => [Edge], { nullable: 'itemsAndList', description: 'A list of edges.' }),
        __metadata("design:type", Array)
    ], PaginatedResponse.prototype, "edges", void 0);
    __decorate([
        type_graphql_1.Field(type => [ItemClass], { nullable: 'itemsAndList', description: 'A list of nodes.' }),
        __metadata("design:type", Array)
    ], PaginatedResponse.prototype, "nodes", void 0);
    __decorate([
        type_graphql_1.Field(type => PageInfo),
        __metadata("design:type", PageInfo)
    ], PaginatedResponse.prototype, "pageInfo", void 0);
    __decorate([
        type_graphql_1.Field(type => String, { nullable: true, description: '"cursor" or "offset"' }),
        __metadata("design:type", String)
    ], PaginatedResponse.prototype, "paginationStyle", void 0);
    PaginatedResponse = __decorate([
        type_graphql_1.ObjectType({ isAbstract: true })
    ], PaginatedResponse);
    return PaginatedResponse;
}
exports.PaginatedResponseGeneric = PaginatedResponseGeneric;
let UserConnection = class UserConnection extends PaginatedResponseGeneric(user_1.default) {
};
UserConnection = __decorate([
    type_graphql_1.ObjectType()
], UserConnection);
exports.UserConnection = UserConnection;
let TweetConnection = class TweetConnection extends PaginatedResponseGeneric(tweet_1.default) {
};
TweetConnection = __decorate([
    type_graphql_1.ObjectType()
], TweetConnection);
exports.TweetConnection = TweetConnection;
