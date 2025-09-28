import vine from '@vinejs/vine'

const createCityValidator = vine.compile(
  vine.object({
    provinceId: vine.number(),
    code: vine.string().trim().maxLength(16),
    name: vine.string().trim().maxLength(255),
    classification: vine.enum(['city', 'regency'] as const).optional(),
  })
)

export default createCityValidator
