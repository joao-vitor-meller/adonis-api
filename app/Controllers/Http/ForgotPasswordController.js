'use strict'

const crypto = require('crypto')
const User = use('App/Models/User')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')

      /**
       * @description: findByOrFail tenta encontrar na coluna email o valor request.email.
       * caso não encontre, retorna um erro, caindo no catch(err)
       */
      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()
    } catch (err) {
      return response.status(err.status).send({
        error: {
          message: 'Algo deu errado. Verifique o e-mail e tente novamente'
        }
      })
    }
  }
}

module.exports = ForgotPasswordController
