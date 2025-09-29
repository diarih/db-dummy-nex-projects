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
import CitiesController from '#controllers/cities_controller'
import GeographyController from '#controllers/geography_controller'
import ProvincesController from '#controllers/provinces_controller'
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

router.get('/geo/tree', [GeographyController, 'tree'])

router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    router.get('users/initiate', [UsersController, 'initiate'])
    router.get('provinces/initiate', [ProvincesController, 'initiate'])
    router.get('cities/initiate', [CitiesController, 'initiate'])

    router.resource('users', UsersController).apiOnly()
    router.resource('provinces', ProvincesController).apiOnly()
    router.resource('cities', CitiesController).apiOnly()
  })
  .middleware(middleware.auth())

