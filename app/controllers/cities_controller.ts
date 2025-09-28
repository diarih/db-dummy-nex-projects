import type { HttpContext } from '@adonisjs/core/http'

import City from '#models/city'
import Province from '#models/province'
import createCityValidator from '#validators/city_create_validator'
import updateCityValidator from '#validators/city_update_validator'

export default class CitiesController {
  public async index({ request }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const perPageInput = Number(request.input('perPage', 25)) || 25
    const perPage = Math.min(Math.max(perPageInput, 1), 100)

    const provinceFilter = request.input('provinceId')

    const citiesQuery = City.query().orderBy('name').preload('province')

    if (provinceFilter !== undefined) {
      const provinceId = Number(provinceFilter)
      if (!Number.isNaN(provinceId)) {
        citiesQuery.where('province_id', provinceId)
      }
    }

    const cities = await citiesQuery.paginate(page, perPage)
    cities.baseUrl(request.url())

    return cities.serialize({
      relations: {
        province: {},
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
