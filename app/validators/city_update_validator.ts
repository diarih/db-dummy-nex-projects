import vine from '@vinejs/vine'

const updateCityValidator = vine.compile(
  vine.object({
    provinceId: vine.number().optional(),
    code: vine.string().trim().maxLength(16).optional(),
    name: vine.string().trim().maxLength(255).optional(),
    classification: vine.enum(['city', 'regency'] as const).optional(),
  })
)

export default updateCityValidator
