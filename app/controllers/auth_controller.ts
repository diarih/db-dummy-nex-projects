import { errors } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import loginValidator from '#validators/login_validator'

export default class AuthController {
  async login({ request, auth, response }: HttpContext) {
    const { email, password, deviceName } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)

      const token = await auth.use('api').createToken(user, [], {
        name: deviceName ?? 'api-token',
        expiresIn: '7 days',
      })

      return response.ok({
        token: token.toJSON(),
        user: user.serialize(),
      })
    } catch (error) {
      console.log("error nih bang", error)
      if (errors.E_INVALID_CREDENTIALS.isError(error)) {
        return response.unauthorized({
          errors: [{ message: 'Invalid email or password' }],
        })
      }

      throw error
    }
  }
}
