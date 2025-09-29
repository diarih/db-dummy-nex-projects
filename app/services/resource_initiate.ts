import City from '#models/city'
import Province from '#models/province'
import User from '#models/user'
import { applyParsedFilters, parseFilterString } from '#services/filter_parser'

export interface OperatorDescriptor {
  data_type: 'char' | 'number'
  operator: string[]
}

export interface OperatorMap {
  [key: string]: OperatorDescriptor
}

interface ParamsSnapshot {
  page: number
  limit: number
  filter: string
}

interface InitiateContent {
  params: ParamsSnapshot
  valid_order_by: string[]
  valid_search_by: string[]
  valid_limit: number[]
  valid_operator: OperatorMap
  enum_data: unknown
  count_data: number
}

const DEFAULT_LIMITS: number[] = [10, 20, 50, 100]
const DEFAULT_LIMIT = DEFAULT_LIMITS[0]

const USERS_OPERATOR_MAP: OperatorMap = {
  id: {
    data_type: 'number',
    operator: ['eq', 'not_eq', 'gt', 'gte', 'lt', 'lte'],
  },
  full_name: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
  email: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
  created_at: {
    data_type: 'char',
    operator: ['between', 'gte', 'lte'],
  },
}

const PROVINCES_OPERATOR_MAP: OperatorMap = {
  id: {
    data_type: 'number',
    operator: ['eq', 'not_eq'],
  },
  code: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
  name: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
}

const CITIES_OPERATOR_MAP: OperatorMap = {
  id: {
    data_type: 'number',
    operator: ['eq', 'not_eq'],
  },
  code: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
  name: {
    data_type: 'char',
    operator: ['like', 'eq'],
  },
  province_id: {
    data_type: 'number',
    operator: ['eq', 'not_eq'],
  },
}

function normalizeFilterString(filter: string | undefined): string {
  if (!filter) {
    return ''
  }

  return filter
    .split(',')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .join(', ')
}

function normalizePage(page: number) {
  return Math.max(1, Math.floor(page) || 1)
}

function normalizeLimit(limit: number) {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_LIMIT
  }

  const sortedLimits = [...DEFAULT_LIMITS].sort((a, b) => a - b)
  const minLimit = sortedLimits[0]
  const maxLimit = sortedLimits[sortedLimits.length - 1]

  const clamped = Math.min(Math.max(Math.floor(limit), minLimit), maxLimit)

  if (DEFAULT_LIMITS.includes(clamped)) {
    return clamped
  }

  let closest = DEFAULT_LIMIT
  let smallestDiff = Number.POSITIVE_INFINITY

  for (const candidate of DEFAULT_LIMITS) {
    const diff = Math.abs(candidate - clamped)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closest = candidate
    }
  }

  return closest
}

function buildParamsSnapshot(
  page: number,
  limit: number,
  filter?: string
): ParamsSnapshot {
  const normalizedLimit = normalizeLimit(limit)

  return {
    page: normalizePage(page),
    limit: normalizedLimit,
    filter: normalizeFilterString(filter),
  }
}

async function resolveFilteredCount(
  model: typeof User | typeof Province | typeof City,
  filters: ReturnType<typeof parseFilterString>
) {
  const query = model.query()
  applyParsedFilters(query, filters)
  const row = await query.count('* as total').first()
  const rawTotal = row?.$extras.total

  if (typeof rawTotal === 'number') {
    return rawTotal
  }

  if (typeof rawTotal === 'bigint') {
    return Number(rawTotal)
  }

  if (typeof rawTotal === 'string') {
    const parsed = Number(rawTotal)
    return Number.isFinite(parsed) ? parsed : 0
  }

  return 0
}

export function buildUsersParamsSnapshot(page: number, limit: number, filter?: string): ParamsSnapshot {
  return buildParamsSnapshot(page, limit, filter)
}

export function buildProvincesParamsSnapshot(
  page: number,
  limit: number,
  filter?: string
): ParamsSnapshot {
  return buildParamsSnapshot(page, limit, filter)
}

export function buildCitiesParamsSnapshot(page: number, limit: number, filter?: string): ParamsSnapshot {
  return buildParamsSnapshot(page, limit, filter)
}

export function getCitiesOperatorMap(): OperatorMap {
  return CITIES_OPERATOR_MAP
}

export async function buildUsersInitiateContent(
  page = 1,
  limit = DEFAULT_LIMIT,
  filter?: string
): Promise<InitiateContent> {
  const parsedFilters = parseFilterString(filter, USERS_OPERATOR_MAP)

  return {
    params: buildUsersParamsSnapshot(page, limit, filter),
    valid_order_by: ['id', 'full_name', 'email', 'created_at'],
    valid_search_by: ['full_name', 'email'],
    valid_limit: [...DEFAULT_LIMITS],
    valid_operator: USERS_OPERATOR_MAP,
    enum_data: null,
    count_data: await resolveFilteredCount(User, parsedFilters),
  }
}

export async function buildProvincesInitiateContent(
  page = 1,
  limit = DEFAULT_LIMIT,
  filter?: string
): Promise<InitiateContent> {
  const parsedFilters = parseFilterString(filter, PROVINCES_OPERATOR_MAP)

  return {
    params: buildProvincesParamsSnapshot(page, limit, filter),
    valid_order_by: ['id', 'code', 'name'],
    valid_search_by: ['code', 'name'],
    valid_limit: [...DEFAULT_LIMITS],
    valid_operator: PROVINCES_OPERATOR_MAP,
    enum_data: null,
    count_data: await resolveFilteredCount(Province, parsedFilters),
  }
}

export async function buildCitiesInitiateContent(
  page = 1,
  limit = DEFAULT_LIMIT,
  filter?: string
): Promise<InitiateContent> {
  const parsedFilters = parseFilterString(filter, CITIES_OPERATOR_MAP)

  return {
    params: buildCitiesParamsSnapshot(page, limit, filter),
    valid_order_by: ['id', 'code', 'name', 'province_id'],
    valid_search_by: ['code', 'name', 'province_id'],
    valid_limit: [...DEFAULT_LIMITS],
    valid_operator: CITIES_OPERATOR_MAP,
    enum_data: null,
    count_data: await resolveFilteredCount(City, parsedFilters),
  }
}
