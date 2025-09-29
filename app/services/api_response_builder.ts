import crypto from 'node:crypto'

import config from '@adonisjs/core/services/config'

interface StatusBlock {
  success: boolean
  code: string
  message: string
  detail: unknown
}

interface FormatOptions<TContent> {
  /**
   * Override whether the standard envelope should be applied.
   */
  wrap?: boolean
  /**
   * Customize the request identifier injected in the header block.
   */
  requestId?: string
  /**
   * Customize the API version placed in the header block.
   */
  version?: string
  /**
   * Customize the timestamp placed in the header block.
   */
  timestamp?: string
  /**
   * Override parts of the status section.
   */
  status?: Partial<StatusBlock>
  /**
   * Additional metadata placed alongside the content.
   */
  meta?: unknown
  /**
   * Overflow container for optional payloads.
   */
  other?: unknown
  /**
   * Replace the data.content node entirely. Useful when building envelopes around
   * primitive values.
   */
  contentFactory?: (content: TContent) => unknown
  /**
   * Override the root key wrapping the full payload.
   */
  rootKey?: string
}

interface ApiResponseConfig {
  useStandardPayload: boolean
  defaultVersion: string
  rootKey: string
}

interface StandardEnvelope {
  header: {
    request_id: string
    version: string
    timestamp: string
  }
  payload: {
    status: StatusBlock
    data: {
      meta: unknown
      content: unknown
    }
    other: unknown
  }
}

const defaultStatus: StatusBlock = {
  success: true,
  code: 'OK',
  message: 'Request processed successfully',
  detail: null,
}

const defaultConfig: ApiResponseConfig = {
  useStandardPayload: false,
  defaultVersion: '1.0.0',
  rootKey: 'nexsoft',
}

class ApiResponseBuilder {
  public format<T>(content: T, options: FormatOptions<T> = {}) {
    const settings = config.get<ApiResponseConfig>('api_response', defaultConfig)
    const shouldWrap = options.wrap ?? settings.useStandardPayload

    if (!shouldWrap) {
      return content
    }

    const status: StatusBlock = {
      ...defaultStatus,
      ...options.status,
    }

    const timestamp = options.timestamp ?? new Date().toISOString()
    const version = options.version ?? settings.defaultVersion
    const requestId = options.requestId ?? crypto.randomUUID()
    const rootKey = options.rootKey ?? settings.rootKey

    const payloadContent = options.contentFactory ? options.contentFactory(content) : content

    const envelope: StandardEnvelope = {
      header: {
        request_id: requestId,
        version,
        timestamp,
      },
      payload: {
        status,
        data: {
          meta: options.meta ?? null,
          content: payloadContent,
        },
        other: options.other ?? null,
      },
    }

    return {
      [rootKey]: envelope,
    }
  }
}

export type { FormatOptions }
export default new ApiResponseBuilder()
