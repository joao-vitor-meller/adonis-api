'use strict'

class SessionController {
  async store ({ request, auth }) {
    const { email, password } = request.all()

    // Gera um token JWT
    const token = await auth.attempt(email, password)

    return token
  }
}

module.exports = SessionController
