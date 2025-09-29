import type { HttpContext } from '@adonisjs/core/http'

import apiResponseBuilder from '#services/api_response_builder'
import { resolveWrapPreference } from '#services/standard_payload'
import {
  buildUsersInitiateContent,
  buildUsersParamsSnapshot,
} from '#services/resource_initiate'
import User from '#models/user'
import createUserValidator from '#validators/user_create_validator'
import updateUserValidator from '#validators/user_update_validator'

function extractMeta(meta: any) {
  if (!meta) {
    return null
  }

  const { per_page: perPage, ...rest } = meta
  return {
    ...rest,
    limit: perPage,
  }
}

export default class UsersController {
  public async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const limitInput = Number(request.input('limit', request.input('perPage', 10))) || 10
    const limit = Math.min(Math.max(limitInput, 1), 50)
    const rawFilter = request.input('filter')

    const users = await User.query().orderBy('id').paginate(page, limit)
    const serialized = users.toJSON()

    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))
    const params = buildUsersParamsSnapshot(page, limit, typeof rawFilter === 'string' ? rawFilter : undefined)
    const meta = extractMeta(serialized.meta)

    return apiResponseBuilder.format(
      {
        params,
        items: serialized.data,
      },
      {
        wrap: wrapPreference,
        meta,
        status: {
          message: 'Successfully get list of users',
        },
      }
    )
  }

  public async initiate({ request }: HttpContext) {
    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))
    const content = await buildUsersInitiateContent()

    return apiResponseBuilder.format(content, {
      wrap: wrapPreference,
      status: {
        message: 'Successfully get initiate list of users',
      },
    })
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
