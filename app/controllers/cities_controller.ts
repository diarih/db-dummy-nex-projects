import type { HttpContext } from '@adonisjs/core/http'

import apiResponseBuilder from '#services/api_response_builder'
import { resolveWrapPreference } from '#services/standard_payload'
import {
  buildCitiesInitiateContent,
  buildCitiesParamsSnapshot,
  getCitiesOperatorMap,
} from '#services/resource_initiate'
import { parseFilterString, applyParsedFilters } from '#services/filter_parser'
import City from '#models/city'
import Province from '#models/province'
import createCityValidator from '#validators/city_create_validator'
import updateCityValidator from '#validators/city_update_validator'

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

export default class CitiesController {
  public async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const limitInput = Number(request.input('limit', request.input('perPage', 25))) || 25
    const limit = Math.min(Math.max(limitInput, 1), 100)

    const provinceFilter = request.input('provinceId')
    const rawFilter = request.input('filter')

    const citiesQuery = City.query().orderBy('name').preload('province')

    if (provinceFilter !== undefined) {
      const provinceId = Number(provinceFilter)
      if (!Number.isNaN(provinceId)) {
        citiesQuery.where('province_id', provinceId)
      }
    }

    const parsedFilters = parseFilterString(rawFilter, getCitiesOperatorMap())
    applyParsedFilters(citiesQuery, parsedFilters)

    const cities = await citiesQuery.paginate(page, limit)
    cities.baseUrl(request.url())

    const serialized = cities.serialize({
      relations: {
        province: {},
      },
    })

    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))
    const params = buildCitiesParamsSnapshot(
      page,
      limit,
      typeof rawFilter === 'string' ? (rawFilter as string) : undefined
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
          message: 'Successfully get list of cities',
        },
      }
    )
  }

  public async initiate({ request }: HttpContext) {
    const wrapPreference = resolveWrapPreference(request.input('standardPayload'))

    const pageInput = Number(request.input('page', 1)) || 1
    const limitInput = Number(request.input('limit', request.input('perPage', 25))) || 25
    const filterInput = typeof request.input('filter') === 'string' ? (request.input('filter') as string) : undefined

    const content = await buildCitiesInitiateContent(pageInput, limitInput, filterInput)

    return apiResponseBuilder.format(content, {
      wrap: wrapPreference,
      status: {
        message: 'Successfully get initiate list of cities',
      },
    })
  }

  public async show({ params }: HttpContext) {
    const city = await City.query().where('id', params.id).preload('province').firstOrFail()

    return city.serialize({ relations: { province: {} } })
  }

  public async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createCityValidator)

    const province = await Province.findOrFail(payload.provinceId)

    const duplicate =
      (await City.query().where('province_id', province.id).where('code', payload.code).first()) ??
      (await City.query().where('province_id', province.id).where('name', payload.name).first())

    if (duplicate) {
      return response.conflict({ errors: [{ message: 'City code or name already exists in this province' }] })
    }

    const city = await City.create({
      provinceId: province.id,
      code: payload.code,
      name: payload.name,
      classification: payload.classification ?? 'city',
    })

    await city.load('province')

    return response.created(city.serialize({ relations: { province: {} } }))
  }

  public async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateCityValidator)

    const city = await City.findOrFail(params.id)

    if (payload.provinceId) {
      await Province.findOrFail(payload.provinceId)
    }

    const targetProvinceId = payload.provinceId ?? city.provinceId

    if (payload.code && (payload.code !== city.code || targetProvinceId !== city.provinceId)) {
      const existingCode = await City.query()
        .where('province_id', targetProvinceId)
        .where('code', payload.code)
        .whereNot('id', city.id)
        .first()

      if (existingCode) {
        return response.conflict({ errors: [{ message: 'City code already exists in this province' }] })
      }
    }

    if (payload.name && (payload.name !== city.name || targetProvinceId !== city.provinceId)) {
      const existingName = await City.query()
        .where('province_id', targetProvinceId)
        .where('name', payload.name)
        .whereNot('id', city.id)
        .first()

      if (existingName) {
        return response.conflict({ errors: [{ message: 'City name already exists in this province' }] })
      }
    }

    city.merge({
      ...payload,
      classification: payload.classification ?? city.classification,
    })

    await city.save()
    await city.load('province')

    return city.serialize({ relations: { province: {} } })
  }

  public async destroy({ params, response }: HttpContext) {
    const city = await City.findOrFail(params.id)
    await city.delete()

    return response.noContent()
  }
}
