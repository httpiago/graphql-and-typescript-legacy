import * as express from 'express'
import * as jwt from 'jwt-simple'
import { randomBytes } from 'crypto'
import { getTime, isAfter, addDays } from 'date-fns'
import db from './database'

const routes = express.Router()

routes.get('/login-confirm', async (req, res) => {
  const { code } = req.query

  if (typeof code === 'undefined') return AuthError(res, { code: 'BAD_REQUEST', message: 'You must have a valid login code to authenticate.' });

  try {
    const splittedCode = decodeURIComponent(code).split('.')
    const [user_id, token, firstLogin] = splittedCode

    const checkTokenIsValid = await db.select('*').from('tokens').where({ token, user_id }).first()

    // Verify that the token is valid
    if (typeof checkTokenIsValid === 'undefined' || splittedCode.length !== 3) return AuthError(res, { code: 'FORBIDDEN', message: 'Invalid login code!' });

    // Delete token to prevent other logins with the same token
    await db.delete().from('tokens').where({ token, type: 'login-code' })

    // Check if the token has expired
    if (isAfter(Date.now(), Number(checkTokenIsValid.expires_in))) return AuthError(res, { code: 'FORBIDDEN', message: 'The token has expired! Please try signing in again.' });

    // Confirm user's email if is first login. 1 = true
    if (firstLogin === '1') {
      await db.table('users').update({ email_verified: true }).where({ id: user_id })
    }

    // AUTHORIZED LOGIN! Generate api access token
    const referenceInDb = randomBytes(16).toString('hex')
    const expires_in = getTime(addDays(Date.now(), 3))
    const payload = {
      user_id,
      referenceInDb,
      scopes: ['api'],
      iat: Date.now(), // issued at
      exp: expires_in, // expiration time
    }
    const jwtToken = jwt.encode(payload, process.env.JWT_SECRET)

    // Save token reference in database
    await db.table('tokens').insert({ type: 'jwt', token: referenceInDb, user_id, expires_in, created_at: new Date().toISOString() })

    res.json({
      "authorization": `Bearer ${jwtToken}`
    });

    // res.redirect('/graphql');
  }
  catch(err) {
    return AuthError(res, { code: 'UNKNOWN', message: 'There was an error completing the login. Try to sign in again.' });
  }
})

type ErrorContext = { code: string; message: string; }
function AuthError(res: express.Response, errorInfos: ErrorContext) {
  res.status(400).json({
    "error": {
      "errors": [
        errorInfos
      ]
    }
  })
}

export default routes