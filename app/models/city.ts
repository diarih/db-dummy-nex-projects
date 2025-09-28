import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Province from '#models/province'

export default class City extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare provinceId: number

  @column()
  declare code: string

  @column()
  declare name: string

  @column()
  declare classification: 'city' | 'regency'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Province)
  declare province: BelongsTo<typeof Province>
}
