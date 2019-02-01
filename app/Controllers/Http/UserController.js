'use strict'

const Database = use('Database')
const User = use('App/Models/User')

class UserController {
  async store ({ request }) {
    // const data = request.all() seleciona todos os campos do body
    const data = request.only(['username', 'email', 'password']) // Seleciona username, email e password do body
    const adresses = request.input('adresses')

    // Utiliza o transaction para previnir erros no CRUD
    const trx = await Database.beginTransaction()

    const user = await User.create(data, trx)
    await user.adresses().createMany(adresses, trx)

    // Se não houver nenhum erro no transaction, ele efetiva a query
    await trx.commit()

    // return json
    return user
  }
}

module.exports = UserController
