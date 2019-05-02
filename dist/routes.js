"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const jwt = require("jwt-simple");
const crypto_1 = require("crypto");
const date_fns_1 = require("date-fns");
const database_1 = require("./database");
const routes = express.Router();
routes.get('/login-confirm', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { code } = req.query;
    if (typeof code === 'undefined')
        return AuthError(res, { code: 'BAD_REQUEST', message: 'You must have a valid login code to authenticate.' });
    try {
        const splittedCode = decodeURIComponent(code).split('.');
        const [user_id, token, firstLogin] = splittedCode;
        const checkTokenIsValid = yield database_1.default.select('*').from('tokens').where({ token, user_id }).first();
        // Verify that the token is valid
        if (typeof checkTokenIsValid === 'undefined' || splittedCode.length !== 3)
            return AuthError(res, { code: 'FORBIDDEN', message: 'Invalid login code!' });
        // Delete token to prevent other logins with the same token
        yield database_1.default.delete().from('tokens').where({ token, type: 'login-code' });
        // Check if the token has expired
        if (date_fns_1.isAfter(Date.now(), Number(checkTokenIsValid.expires_in)))
            return AuthError(res, { code: 'FORBIDDEN', message: 'The token has expired! Please try signing in again.' });
        // Confirm user's email if is first login. 1 = true
        if (firstLogin === '1') {
            yield database_1.default.table('users').update({ email_verified: true }).where({ id: user_id });
        }
        // AUTHORIZED LOGIN! Generate api access token
        const referenceInDb = crypto_1.randomBytes(16).toString('hex');
        const expires_in = date_fns_1.getTime(date_fns_1.addDays(Date.now(), 3));
        const payload = {
            user_id,
            referenceInDb,
            scopes: ['api'],
            iat: Date.now(),
            exp: expires_in,
        };
        const jwtToken = jwt.encode(payload, process.env.JWT_SECRET);
        // Save token reference in database
        yield database_1.default.table('tokens').insert({ type: 'jwt', token: referenceInDb, user_id, expires_in, created_at: new Date().toISOString() });
        res.json({
            "authorization": `Bearer ${jwtToken}`
        });
        // res.redirect('/graphql');
    }
    catch (err) {
        return AuthError(res, { code: 'UNKNOWN', message: 'There was an error completing the login. Try to sign in again.' });
    }
}));
function AuthError(res, errorInfos) {
    res.status(400).json({
        "error": {
            "errors": [
                errorInfos
            ]
        }
    });
}
exports.default = routes;
