'use strict'

class User {
  // Valida todos os campos enviados no body. O default é false.
  get validateAll () {
    return true
  }

  /**
   * required: obrigatório
   * unique:table: o campo não pode se repetir na tabela
   * confirmed:
   */
  get rules () {
    return {
      username: 'required|unique:users',
      email: 'required|email|unique:users',
      password: 'required|confirmed'
    }
  }
}

module.exports = User
