'use strict'

const Model = use('Model')
const Hash = use('Hash')

class User extends Model {
  static boot () {
    super.boot()

    /**
     * Executa um Hook no usuário antes do mesmo ser alterado no banco de dados
     * Criptografa a senha ao alterar a senha ou cadastrar uma nova
     */
    this.addHook('beforeSave', async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  /**
   * Trata a questão de relacionamento entre User e Token
   *
   * @method tokens
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  /**
   * Relaciona o usuário com Projects e Tasks
   */
  projects () {
    return this.hasMany('App/Models/Project')
  }

  tasks () {
    return this.hasMany('App/Models/Task')
  }
}

module.exports = User
