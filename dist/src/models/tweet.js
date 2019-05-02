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
const class_validator_1 = require("class-validator");
let Tweet = class Tweet {
};
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", Number)
], Tweet.prototype, "id", void 0);
__decorate([
    type_graphql_1.Field(),
    class_validator_1.Length(1, 140),
    __metadata("design:type", String)
], Tweet.prototype, "content", void 0);
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID),
    __metadata("design:type", String)
], Tweet.prototype, "user_id", void 0);
__decorate([
    type_graphql_1.Field(type => type_graphql_1.ID, { nullable: true }),
    __metadata("design:type", String)
], Tweet.prototype, "reply_to", void 0);
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", Date)
], Tweet.prototype, "created_at", void 0);
Tweet = __decorate([
    type_graphql_1.ObjectType({ description: 'Data structure of a tweet.' })
], Tweet);
exports.default = Tweet;
