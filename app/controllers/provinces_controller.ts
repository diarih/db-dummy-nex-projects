import type { HttpContext } from '@adonisjs/core/http'

import Province from '#models/province'
import createProvinceValidator from '#validators/province_create_validator'
import updateProvinceValidator from '#validators/province_update_validator'

export default class ProvincesController {
  public async index({ request }: HttpContext) {
    const withCitiesFlag = String(request.input('withCities', 'false')).toLowerCase()
    const withCities = ['1', 'true', 'yes'].includes(withCitiesFlag)

    const page = Number(request.input('page', 1)) || 1
    const perPageInput = Number(request.input('perPage', 25)) || 25
    const perPage = Math.min(Math.max(perPageInput, 1), 100)

    const query = Province.query().orderBy('name')

    if (withCities) {
      query.preload('cities')
    }

    const provinces = await query.paginate(page, perPage)
    provinces.baseUrl(request.url())

    if (withCities) {
      return provinces.serialize({
        relations: {
          cities: {},
        },
      })
    }

    return provinces.serialize()
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
