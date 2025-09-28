import vine from '@vinejs/vine'

const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().optional(),
    password: vine.string().trim().minLength(8).optional(),
    fullName: vine.string().trim().maxLength(255).optional(),
  })
)

export default updateUserValidator
