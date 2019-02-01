'use strict'

const File = use('App/Models/File')
const Helpers = use('Helpers')

class FileController {
  /**
   * Return image file
   * GET files/:id
   */
  async show ({ params, response }) {
    const file = await File.findOrFail(params.id)

    return response.download(Helpers.tmpPath(`uploads/${file.file}`))
  }

  /**
   * Create/save new file
   * POST files
   */
  async store ({ request, response }) {
    try {
      if (!request.file('file')) return

      // CAPTURA O ARQUIVO DA REQUISIÇÃO E O RENOMEIA PARA ENVIAR A PASTA LOCAL
      const upload = request.file('file', { size: '2mb' })
      const filename = `${Date.now()}.${upload.subtype}`

      // SALVA O ARQUIVO
      await upload.move(Helpers.tmpPath('uploads'), {
        name: filename
      })

      // CASO TENHA ERROS EM ENVIAR O ARQUIVO PARA A PASTA, A API EMITE UM ERRO(catch(err))
      if (!upload.moved()) {
        throw upload.error()
      }

      // SALVA OS DADOS DO ARQUIVO NA TABELA FILE
      const file = await File.create({
        file: filename,
        name: upload.clientName,
        type: upload.type,
        subtype: upload.subtype
      })

      return file
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Erro no upload do arquivo' } })
    }
  }
}

module.exports = FileController
