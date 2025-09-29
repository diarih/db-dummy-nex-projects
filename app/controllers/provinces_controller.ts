import type { HttpContext } from '@adonisjs/core/http'

import apiResponseBuilder from '#services/api_response_builder'
import { resolveWrapPreference } from '#services/standard_payload'
import {
  buildProvincesInitiateContent,
  buildProvincesParamsSnapshot,
} from '#services/resource_initiate'
import Province from '#models/province'
import createProvinceValidator from '#validators/province_create_validator'
import updateProvinceValidator from '#validators/province_update_validator'

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

export default class ProvincesController {
  public async index({ request }: HttpContext) {
    const withCitiesFlag = String(request.input('withCities', 'false')).toLowerCase()
    const withCities = ['1', 'true', 'yes'].includes(withCitiesFlag)

    const page = Number(request.input('page', 1)) || 1
    const limitInput = Number(request.input('limit', request.input('perPage', 25))) || 25
    const limit = Math.min(Math.max(limitInput, 1), 100)
    const rawFilter = request.input('filter')

    const query = Province.query().orderBy('name')

    if (withCities) {
      query.preload('cities')
    }

    const provinces = await query.paginate(page, limit)
    provinces.baseUrl(request.url())

    const serialized = withCities
      ? provinces.serialize({
          relations: {
            cities: {},
          },
        })
      : provinces.serialize()

    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))
    const params = buildProvincesParamsSnapshot(
      page,
      limit,
      typeof rawFilter === 'string' ? rawFilter : undefined
    )
    const meta = extractMeta((serialized as any)?.meta)

    return apiResponseBuilder.format(
      {
        params,
        items: serialized.data,
      },
      {
        wrap: wrapPreference,
        meta,
        status: {
          message: 'Successfully get list of provinces',
        },
      }
    )
  }

  public async initiate({ request }: HttpContext) {
    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))
    const content = await buildProvincesInitiateContent()

    return apiResponseBuilder.format(content, {
      wrap: wrapPreference,
      status: {
        message: 'Successfully get initiate list of provinces',
      },
    })
  }

  public async show({ params }: HttpContext) {
    const province = await Province.query().where('id', params.id).preload('cities').firstOrFail()

    return province.serialize({
      relations: {
        cities: {},
      },
    })
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createProvinceValidator)

    const duplicate =
      (await Province.findBy('code', payload.code)) ?? (await Province.findBy('name', payload.name))

    if (duplicate) {
      return response.conflict({ errors: [{ message: 'Province code or name already exists' }] })
    }

    const province = await Province.create(payload)

    return response.created(province.serialize())
  }

  public async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateProvinceValidator)

    const province = await Province.findOrFail(params.id)

    if (payload.code && payload.code !== province.code) {
      const existingCode = await Province.findBy('code', payload.code)
      if (existingCode) {
        return response.conflict({ errors: [{ message: 'Province code already exists' }] })
      }
    }

    if (payload.name && payload.name !== province.name) {
      const existingName = await Province.findBy('name', payload.name)
      if (existingName) {
        return response.conflict({ errors: [{ message: 'Province name already exists' }] })
      }
    }

    province.merge(payload)
    await province.save()

    return province.serialize()
  }

  public async destroy({ params, response }: HttpContext) {
    const province = await Province.findOrFail(params.id)
    await province.delete()

    return response.noContent()
  }
}
