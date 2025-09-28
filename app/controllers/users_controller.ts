import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import createUserValidator from '#validators/user_create_validator'
import updateUserValidator from '#validators/user_update_validator'

export default class UsersController {
  public async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const perPageInput = Number(request.input('perPage', 10)) || 10
    const perPage = Math.min(Math.max(perPageInput, 1), 50)

    const users = await User.query().orderBy('id').paginate(page, perPage)

    return users.toJSON()
  }

  public async show({ params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return user.serialize()
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createUserValidator)

    const existing = await User.findBy('email', payload.email)
    if (existing) {
      return response.conflict({ errors: [{ message: 'Email already in use' }] })
    }

    const user = await User.create(payload)
    return response.created(user.serialize())
  }

  public async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateUserValidator)
    const user = await User.findOrFail(params.id)

    if (payload.email && payload.email !== user.email) {
      const existing = await User.findBy('email', payload.email)
      if (existing) {
        return response.conflict({ errors: [{ message: 'Email already in use' }] })
      }
    }

    user.merge(payload)
    await user.save()

    return user.serialize()
  }

  public async destroy({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()

    return response.noContent()
  }
}
