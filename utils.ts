import { Request } from 'express';
import * as jwt from 'jwt-simple'
import { isAfter } from 'date-fns';

/**
 * Encode a string to base64 (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
export function encode(text: string) {
  return Buffer.from(String(text)).toString('base64');
}

type Base64String = string;

/**
 * Decode a base64 string (using the Node built-in Buffer)
 *
 * Stolen from http://stackoverflow.com/a/38237610/2115623
 */
export function decode(encodedText: Base64String) {
  return Buffer.from(encodedText, 'base64').toString('ascii');
}

export function parseRequestToken({ headers }: Request): { [index: string]: any } | null {
  if (typeof headers === 'undefined' || typeof headers.authorization === 'undefined') return null

  const token = headers.authorization.split(' ')
  // Checar se o token é válido
  if (token.length !== 2 || token[0] !== 'Bearer') throw new Error('Invalid token. Format is Authorization: Bearer [token]');

  const decoded = jwt.decode(token[1], process.env.JWT_SECRET)

  if (isAfter(Date.now(), decoded.exp)) throw new Error('The token has expired.');

  return decoded || null;
}