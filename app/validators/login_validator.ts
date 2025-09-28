import vine from '@vinejs/vine'

const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    deviceName: vine.string().trim().maxLength(255).optional(),
  })
)

export default loginValidator
