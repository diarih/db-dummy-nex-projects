const TRUTHY_FLAGS = ['1', 'true', 'yes', 'on']
const FALSY_FLAGS = ['0', 'false', 'no', 'off']

export function resolveWrapPreference(value: unknown): boolean | undefined {
  if (value === undefined || value === null) {
    return undefined
  }

  if (typeof value === 'boolean') {
    return value
  }

  const normalized = String(value).trim().toLowerCase()

  if (TRUTHY_FLAGS.includes(normalized)) {
    return true
  }

  if (FALSY_FLAGS.includes(normalized)) {
    return false
  }

  return undefined
}
