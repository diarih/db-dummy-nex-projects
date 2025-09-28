import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cities'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('province_id').unsigned().references('id').inTable('provinces').onDelete('CASCADE')
      table.string('code', 16).notNullable()
      table.string('name', 255).notNullable()
      table.enum('classification', ['city', 'regency']).notNullable().defaultTo('city')

      table.unique(['province_id', 'code'])
      table.unique(['province_id', 'name'])

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
