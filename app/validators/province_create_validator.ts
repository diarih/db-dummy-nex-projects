import vine from '@vinejs/vine'

const createProvinceValidator = vine.compile(
  vine.object({
    code: vine.string().trim().maxLength(16),
    name: vine.string().trim().maxLength(255),
  })
)

export default createProvinceValidator
