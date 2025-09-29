import env from '#start/env'
import app from '@adonisjs/core/services/app'

const apiResponseConfig = {
  /**
   * When true, the response builder will wrap payloads using the standard
   * envelope unless explicitly disabled per call.
   */
  useStandardPayload: env.get('API_STANDARD_PAYLOAD', 'false') === 'true',
  /**
   * Default API version propagated inside the response header block.
   */
  defaultVersion: env.get('API_STANDARD_PAYLOAD_VERSION', app.version?.toString() ?? '1.0.0'),
  /**
   * Root object key wrapping the structured payload output.
   */
  rootKey: env.get('API_STANDARD_PAYLOAD_ROOT_KEY', 'nexsoft'),
}

export default apiResponseConfig
