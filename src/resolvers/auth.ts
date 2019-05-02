import { Resolver, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import * as isEmail from 'email-validator'
import { randomBytes } from 'crypto'
import { addMinutes, getTime } from 'date-fns'
import { sendEmail } from "../../utils";
import GenericError from "../genericError";
import db from '../../database'
import { Context } from "../../types";

@Resolver()
class AuthResolvers {

  @Mutation(returns => String, { description: "Sign in/Sign up user. A magic link to complete the login will be sent to the user's email.", complexity: 20 })
  async login(
    @Arg('email') email: string
  ) {
    if (typeof email === 'undefined') throw new GenericError('BAD_REQUEST', 'Define an "email".')
    if (!isEmail.validate(email)) throw new GenericError('BAD_REQUEST', 'Invalid email.')

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
      const confirmLink = `${process.env.BASE_DOMAIN}/login-confirm?code=${encodeURIComponent(code)}`
      await sendEmail({
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
      })

      if (!userAlreadyRegistered) {
        return 'User registered and Email sent!';
      } else {
        return 'Email sent!';
      }
    }
    catch(err) {
      console.error(err)
      throw new GenericError('UNKNOWN', 'There was an error logging in the user. :(');
    }
  }


  @Authorized()
  @Mutation(returns => String, { description: 'Revoke all registered login tokens of the current user.', complexity: 5, })
  async revokeAllTokensOfCurrentUser(
    @Ctx() { currentUserId }: Context,
    @Arg('except', { nullable: true }) except?: string,
  ): Promise<string> {
    try {
      await db.table('tokens')
        .update({ is_revoked: true })
        .where({ 'user_id': currentUserId })
        .whereNot({ 'token': except || 'tknnn' })

      return 'Done.';
    }
    catch(err) {
      console.error(err)
      throw new GenericError('UNKNOWN', 'There was an error logging in the user. :(');
    }
  }
}

export default AuthResolvers