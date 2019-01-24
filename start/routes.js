'use strict'

const Route = use('Route')

/**
 * AUTENTICAÇÃO
 */
Route.post('/users', 'UserController.store')
Route.post('/sessions', 'SessionController.store')

/**
 * PASSWORD RESET
 */
Route.post('/passwords', 'ForgotPasswordController.store')
Route.put('/passwords', 'ForgotPasswordController.update')

/**
 * FILES
 */
Route.get('/files/:id', 'FileController.show')

/**
 * AUTH
 */
Route.group(() => {
  /**
   * FILES
   */
  Route.post('/files', 'FileController.store')

  /**
   * PROJECTS
   */
  Route.resource('/projects', 'ProjectController').apiOnly()
}).middleware(['auth'])
