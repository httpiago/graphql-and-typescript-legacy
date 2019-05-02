"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex = require("knex");
const configs = require('../knexfile')['production'];
/**
 * Query database.
 * @see https://knexjs.org/
 */
const db = knex(configs);
exports.default = db;
