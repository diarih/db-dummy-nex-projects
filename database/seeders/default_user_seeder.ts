import { BaseSeeder } from '@adonisjs/lucid/seeders'

import User from '#models/user'

export default class DefaultUserSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    const email = 'admin@admin.com'

    const existing = await User.findBy('email', email)
    if (existing) {
      return
    }

    await User.create({
      email,
      password: 'admin1234',
      fullName: 'Administrator',
    })
  }
}
