import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

import type { OperatorMap } from '#services/resource_initiate'

const SUPPORTED_OPERATORS = new Set(['like', 'eq', 'not_eq', 'gt', 'gte', 'lt', 'lte'])

export type ParsedFilter = {
  field: string
  operator: string
  value: string | number
}

function sanitizeScalar(value: string) {
  const trimmed = value.trim()
  return trimmed.replace(/^['"]|['"]$/g, '')
}

export function parseFilterString(filter: unknown, operators: OperatorMap): ParsedFilter[] {
  if (typeof filter !== 'string' || !filter.trim()) {
    return []
  }

  const clauses = filter
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  const parsed: ParsedFilter[] = []

  for (const clause of clauses) {
    const match = clause.match(/^([^\s]+)\s+(\w+)\s+(.+)$/)
    if (!match) {
      continue
    }

    const [, rawField, rawOperator, rawValue] = match
    const field = rawField.trim()
    const operator = rawOperator.trim().toLowerCase()

    if (!SUPPORTED_OPERATORS.has(operator)) {
      continue
    }

    const descriptor = operators[field]
    if (!descriptor || !descriptor.operator.includes(operator)) {
      continue
    }

    const scalar = sanitizeScalar(rawValue)

    if (descriptor.data_type === 'number') {
      const numeric = Number(scalar)
      if (!Number.isFinite(numeric)) {
        continue
      }

      parsed.push({ field, operator, value: numeric })
      continue
    }

    parsed.push({ field, operator, value: scalar })
  }

  return parsed
}

export function applyParsedFilters(
  builder: ModelQueryBuilderContract<any>,
  filters: ParsedFilter[] = []
) {
  for (const clause of filters) {
    const column = clause.field
    const value = clause.value

    switch (clause.operator) {
      case 'like': {
        const baseValue = typeof value === 'string' ? value : String(value)
        const pattern = baseValue.includes('%') ? baseValue : `%${baseValue}%`
        builder.whereILike(column, pattern)
        break
      }
      case 'eq':
        builder.where(column, value)
        break
      case 'not_eq':
        builder.whereNot(column, value)
        break
      case 'gt':
        builder.where(column, '>', value)
        break
      case 'gte':
        builder.where(column, '>=', value)
        break
      case 'lt':
        builder.where(column, '<', value)
        break
      case 'lte':
        builder.where(column, '<=', value)
        break
      default:
        break
    }
  }
}
