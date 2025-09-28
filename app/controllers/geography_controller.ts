import Province from '#models/province'

export default class GeographyController {
  public async tree() {
    const provinces = await Province.query().orderBy('name').preload('cities')

    return provinces.map((province) => province.serialize({ relations: { cities: {} } }))
  }
}
