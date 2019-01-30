'use strict'

const User = use('App/Models/User')

class UserController {
  async store ({ request }) {
    // const data = request.all() seleciona todos os campos do body
    const data = request.only(['username', 'email', 'password']) // Seleciona username, email e password do body
    const user = await User.create(data)

    // return json
    return user
  }
}

module.exports = UserController
