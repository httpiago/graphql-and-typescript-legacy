import * as express from 'express'
import * as isEmail from 'email-validator'
import * as jwt from 'jwt-simple'
import { randomBytes } from 'crypto'
import { addMinutes, getTime, isAfter, addDays } from 'date-fns'
import db from './database'

const routes = express.Router()

routes.get('/login', (req, res) => {
  res.send(`
    <h1>Login/Sign up:</h1>
    <form action="/login" method="POST">
      <input type="email" name="email" required placeholder="Enter your email..." style="width: 200px;" />
      <input type="submit" value="Login" />
    </form>
  `)
})

routes.post('/login', async (req, res) => {
  const { email } = req.body

  if (typeof email === 'undefined') return AuthError(res, { code: 'BAD_REQUEST', message: 'Define an "email".' });
  if (!isEmail.validate(email)) return AuthError(res, { code: 'BAD_REQUEST', message: '.' });

  try {
    // Verify if the User is already registered
    const user = await db.select('id').from('users').where({ email }).first()
    const userAlreadyRegistered = (typeof user !== 'undefined')
    let user_id = userAlreadyRegistered ? user.id : ''

    if (userAlreadyRegistered === false) {
      // Register new user in the database
      user_id = await db.insert({ email }).into('users').returning('id').then(r => r[0])
    }

    // Generate login code
    const token = randomBytes(16).toString('hex'), firstLogin = +!userAlreadyRegistered
    const code = [user_id, token, firstLogin].join('.')

    // Save code in the database for future verification in route /login-confirm
    await db.insert({
      token,
      user_id,
      type: 'login-code',
      expires_in: getTime(addMinutes(Date.now(), 30)),
      created_at: new Date().toISOString(),
    }).into('tokens')

    // Send email to the user with magic login link
    // !!!JUST FOR TEST PURPOSE!!! You must send the code to the user's email!
    return res.send(`
      <h1>Email sent!</h1>
      <br/><br/><br/><br/>
      <h2>Fake email inbox:</h2>
      <a href="/login-confirm?code=${code}">Confirm login</a>
    `)

    if (!userAlreadyRegistered) {
      res.send('User registered and Email sent!');
    } else {
      res.send('Email sent!');
    }
  }
  catch(err) {
    console.error(err)
    return AuthError(res, { code: 'UNKNOWN', message: 'There was an error logging in the user. :(' });
  }
})

routes.get('/login-confirm', async (req, res) => {
  const { code } = req.query

  if (typeof code === 'undefined') return AuthError(res, { code: 'BAD_REQUEST', message: 'You must have a valid login code to authenticate.' });

  try {
    const splittedCode = code.split('.')
    const [user_id, token, firstLogin] = splittedCode

    const checkTokenIsValid = await db.select('*').from('tokens').where({ token, user_id }).first()

    // Verify that the token is valid
    if (typeof checkTokenIsValid === 'undefined' || splittedCode.length !== 3) return AuthError(res, { code: 'FORBIDDEN', message: 'Invalid login code!' });

    // Delete token to prevent other logins with the same token
    await db.delete().from('tokens').where({ token })

    // Check if the token has expired
    if (isAfter(Date.now(), Number(checkTokenIsValid.expires_in))) return AuthError(res, { code: 'FORBIDDEN', message: 'The token has expired! Please try signing in again.' });

    // Confirm user's email if is first login. 1 = true
    if (firstLogin === '1') {
      await db.table('users').update({ email_verified: true }).where({ id: user_id })
    }

    // AUTHORIZED LOGIN! Generate api access token
    const payload = {
      user_id,
      iat: Date.now(), // issued at
      exp: getTime(addDays(Date.now(), 3)) // expiration time
    }
    const jwtToken = jwt.encode(payload, process.env.JWT_SECRET)

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