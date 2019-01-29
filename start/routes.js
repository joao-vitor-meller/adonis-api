'use strict'

const Route = use('Route')

/**
 * AUTENTICAÇÃO
 */
Route.post('/users', 'UserController.store').validator('User')
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
 * @description: AUTH GROUP
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

  /**
   * TASKS
   * projects.tasks para setar o id de projects como default em todas as rotas filhas de tasks
   */
  Route.resource('/projects.tasks', 'TaskController').apiOnly()
}).middleware(['auth'])
