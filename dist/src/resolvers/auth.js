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
const isEmail = require("email-validator");
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const utils_1 = require("../../utils");
const genericError_1 = require("../genericError");
const database_1 = require("../../database");
let AuthResolvers = class AuthResolvers {
    login(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof email === 'undefined')
                throw new genericError_1.default('BAD_REQUEST', 'Define an "email".');
            if (!isEmail.validate(email))
                throw new genericError_1.default('BAD_REQUEST', 'Invalid email.');
            try {
                // Verify if the User is already registered
                const user = yield database_1.default.select('id').from('users').where({ email }).first();
                const userAlreadyRegistered = (typeof user !== 'undefined');
                let user_id = userAlreadyRegistered ? user.id : '';
                if (userAlreadyRegistered === false) {
                    // Register new user in the database
                    user_id = yield database_1.default.insert({ email }).into('users').returning('id').then(r => r[0]);
                }
                // Generate login code
                const token = crypto_1.randomBytes(16).toString('hex'), firstLogin = +!userAlreadyRegistered;
                const code = [user_id, token, firstLogin].join('.');
                // Save code in the database for future verification in route /login-confirm
                yield database_1.default.insert({
                    token,
                    user_id,
                    type: 'login-code',
                    expires_in: date_fns_1.getTime(date_fns_1.addMinutes(Date.now(), 30)),
                    created_at: new Date().toISOString(),
                }).into('tokens');
                // Send email to the user with magic login link
                const confirmLink = `${process.env.BASE_DOMAIN}/login-confirm?code=${encodeURIComponent(code)}`;
                yield utils_1.sendEmail({
                    to: email,
                    subject: 'Login Verification to graphql-server-with-typescript',
                    body: `<div style="font-size: 14px;">
          <p>Hello,</p>
          <p>We have received a login attempt with your email.<br/>
          To complete the login process, please click the button below:</p>

          <a href="${confirmLink}" style="background-color: #2196F3;border-radius: 5px;color: #ffffff;display: inline-block;font-size: 14px;font-weight: bold;line-height: 50px;text-align: center;text-decoration: none;width: 200px;">
            CONFIRM LOGIN
          </a>

          <p>Or copy and paste this URL into your browser:</p>
          <a href="${confirmLink}">${confirmLink}</a>

          <hr style="border:none;border-top:1px solid #eaeaea;margin:26px 0;width:100%">
          <p style="color:#666666;font-size:12px;line-height:24px;">If you didn't attempt to log in but received this email, please ignore this email. If you are concerned about your account's safety, get in touch with us.</p>
        </div>`
                });
                if (!userAlreadyRegistered) {
                    return 'User registered and Email sent!';
                }
                else {
                    return 'Email sent!';
                }
            }
            catch (err) {
                console.error(err);
                throw new genericError_1.default('UNKNOWN', 'There was an error logging in the user. :(');
            }
        });
    }
    revokeAllTokensOfCurrentUser({ currentUserId }, except) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield database_1.default.table('tokens')
                    .update({ is_revoked: true })
                    .where({ 'user_id': currentUserId })
                    .whereNot({ 'token': except || 'tknnn' });
                return 'Done.';
            }
            catch (err) {
                console.error(err);
                throw new genericError_1.default('UNKNOWN', 'There was an error logging in the user. :(');
            }
        });
    }
};
__decorate([
    type_graphql_1.Mutation(returns => String, { description: "Sign in/Sign up user. A magic link to complete the login will be sent to the user's email.", complexity: 20 }),
    __param(0, type_graphql_1.Arg('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthResolvers.prototype, "login", null);
__decorate([
    type_graphql_1.Authorized(),
    type_graphql_1.Mutation(returns => String, { description: 'Revoke all registered login tokens of the current user.', complexity: 5, }),
    __param(0, type_graphql_1.Ctx()),
    __param(1, type_graphql_1.Arg('except', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthResolvers.prototype, "revokeAllTokensOfCurrentUser", null);
AuthResolvers = __decorate([
    type_graphql_1.Resolver()
], AuthResolvers);
exports.default = AuthResolvers;
