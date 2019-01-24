'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Project extends Model {
  user () {
    // Um projeto pertence a um usuário
    return this.belongsTo('App/Models/User')
  }

  tasks () {
    // Um projeto pode conter várias tasks
    return this.hasMany('App/Models/Task')
  }
}

module.exports = Project
