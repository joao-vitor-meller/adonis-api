'use strict'

const Route = use('Route')

/**
 * AUTENTICAÇÃO
 */
Route.post('users', 'UserController.store').validator('User')
Route.post('sessions', 'SessionController.store').validator('Sessions')

/**
 * PASSWORD RESET
 */
Route.post('passwords', 'ForgotPasswordController.store').validator(
  'ForgotPassword'
)
Route.put('passwords', 'ForgotPasswordController.update').validator(
  'ResetPassword'
)

/**
 * FILES
 */
Route.get('files/:id', 'FileController.show')

/**
 * @description: AUTH GROUP
 */
Route.group(() => {
  /**
   * FILES
   */
  Route.post('files', 'FileController.store')

  /**
   * PROJECTS
   */
  Route.resource('projects', 'ProjectController')
    .apiOnly()
    .validator(new Map([[['projects.store'], ['Project']]]))

  /**
   * TASKS
   * projects.tasks para setar o id de projects como default em todas as rotas filhas de tasks
   */
  Route.resource('projects.tasks', 'TaskController')
    .apiOnly()
    .validator(new Map([[['projects.tasks.store'], ['Task']]]))
}).middleware(['auth'])
