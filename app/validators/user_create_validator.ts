import vine from '@vinejs/vine'

const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    fullName: vine.string().trim().maxLength(255).optional(),
  })
)

export default createUserValidator
