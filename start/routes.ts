/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'

import AuthController from '#controllers/auth_controller'
import UsersController from '#controllers/users_controller'
import { middleware } from '#start/kernel'

router.get('/', ({ response }) => {
  return response.ok({
    service: 'db-dummy-nex-projects',
    version: app.version?.toString() ?? '0.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  })
})

router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    router.resource('users', UsersController).apiOnly()
  })
  .middleware(middleware.auth())
