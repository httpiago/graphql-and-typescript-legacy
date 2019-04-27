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