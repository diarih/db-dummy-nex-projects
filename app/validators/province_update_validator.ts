import vine from '@vinejs/vine'

const updateProvinceValidator = vine.compile(
  vine.object({
    code: vine.string().trim().maxLength(16).optional(),
    name: vine.string().trim().maxLength(255).optional(),
  })
)

export default updateProvinceValidator
