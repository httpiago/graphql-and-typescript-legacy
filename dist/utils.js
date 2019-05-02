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
const jwt = require("jwt-simple");
const date_fns_1 = require("date-fns");
const nodemailer = require("nodemailer");
const genericError_1 = require("./src/genericError");
const database_1 = require("./database");
/**
 * Encode a string to base64 (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
function encode(text) {
    return Buffer.from(String(text)).toString('base64');
}
exports.encode = encode;
/**
 * Decode a base64 string (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
function decode(encodedText) {
    return Buffer.from(encodedText, 'base64').toString('ascii');
}
exports.decode = decode;
function parseRequestToken({ headers }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof headers === 'undefined' || typeof headers.authorization === 'undefined')
            return null;
        const token = headers.authorization.split(' ');
        // Checar se o token é válido
        if (token.length !== 2 || token[0] !== 'Bearer')
            throw new Error('Invalid token. Format is Authorization: Bearer [token]');
        const decoded = jwt.decode(token[1], process.env.JWT_SECRET);
        if (date_fns_1.isAfter(Date.now(), decoded.exp))
            throw new Error('The token has expired.');
        const checkToken = yield database_1.default.table('tokens').where({ type: 'jwt', token: decoded.referenceInDb, is_revoked: false }).first('*');
        if (typeof checkToken === 'undefined' || checkToken.is_revoked === true) {
            throw new Error('Invalid token!');
        }
        return decoded || null;
    });
}
exports.parseRequestToken = parseRequestToken;
/**
 * Search for rows in a table using pagination and return the result expected by Graphql schema.
 */
function getPaginatedRowsFromTable({ columns, tableName, after, offset, first, where }) {
    return __awaiter(this, void 0, void 0, function* () {
        const cols = typeof columns === 'string' ? columns : `"${columns.join('", "')}"`;
        let query = [`SELECT * FROM (
    SELECT ${cols}, ROW_NUMBER() OVER (ORDER BY id) FROM "${tableName}"
  ) AS X`];
        // Cursor-based pagination
        if (typeof after !== 'undefined') {
            query.push(`WHERE "id" > ${decode(after)}`);
        }
        // Add additional filters to query
        if (typeof where !== 'undefined') {
            if (!after) {
                query.push('WHERE ' + where.join(' AND '));
            }
            else {
                query.push('AND ' + where.join(' AND '));
            }
        }
        query.push('ORDER BY id ASC'); // Newest first
        query.push(`LIMIT ${first}`);
        // Offset-based pagination
        if (typeof offset !== 'undefined' && typeof after === 'undefined') {
            query.push(`OFFSET ${offset}`);
        }
        let result;
        try {
            // RUN QUERY
            result = yield database_1.default.raw(query.join(' ')).then(res => res.rows);
        }
        catch (err) {
            console.error('getPaginatedRowsFromTable ERROR', err);
            throw new genericError_1.default('UNKNOWN', 'There was a problem fetching the elements.');
        }
        // Get the total rows in the table
        const totalCount = yield database_1.default.table(tableName).whereRaw((where || []).join(' AND ')).count('* as total').then(r => r[0].total);
        const hasAtLeast1Item = (result.length >= 1);
        const lastItem = result[result.length - 1], firstItem = result[0];
        return {
            edges: result.map(item => ({
                node: item,
                cursor: encode(item.id)
            })),
            nodes: result,
            totalCount,
            pageInfo: {
                size: Math.min(first, result.length),
                hasPreviousPage: hasAtLeast1Item ? (Number(firstItem.row_number) > 1) : null,
                hasNextPage: hasAtLeast1Item ? (Number(lastItem.row_number) < totalCount) : null,
                startCursor: hasAtLeast1Item ? encode(firstItem.id) : null,
                endCursor: hasAtLeast1Item ? encode(lastItem.id) : null,
            },
            paginationStyle: after ? 'cursor' : offset ? 'offset' : null,
        };
    });
}
exports.getPaginatedRowsFromTable = getPaginatedRowsFromTable;
/**
 * @see https://nodemailer.com/about/
 */
function sendEmail({ to, subject, body }) {
    return __awaiter(this, void 0, void 0, function* () {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        });
        yield transporter.sendMail({
            from: `"graphql-test-api" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html: body // html body
        });
        return true;
    });
}
exports.sendEmail = sendEmail;
