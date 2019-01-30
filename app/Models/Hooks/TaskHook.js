'use strict'

const Mail = use('Mail')
const Helpers = use('Helpers')
const TaskHook = (exports = module.exports = {})

TaskHook.sendNewTaskMail = async taskInstance => {
  /**
   * Verifica se a task possui um user_id no momento de sua criação, ou se foi alterado em algum momento na aplicação
   * Caso não tenha um user_id, o hook não será disparado
   * Quando o hook é disparado, um e-mail sera enviado ao usuário que deve realizar a Task em questão, e caso a task possua um
   * arquivo realcionado, esse será enviado em anexo
   */
  if (!taskInstance.user_id && !taskInstance.dirty.user_id) return

  /**
   * Consulta os relacionamentos da task para enviar o e-mail ao usuário responsável pela mesma
   */
  const { email, username } = await taskInstance.user().fetch()
  const file = await taskInstance.file().fetch()
  const { title } = taskInstance

  await Mail.send(
    ['emails.new_task'],
    {
      username,
      title,
      hasAttachment: !!file
    },
    message => {
      message
        .to(email)
        .from('maiconrs95@gmail.com', 'Maicon')
        .subject('Uma nova tarefa foi adicionada em sua lista.')

      if (file) {
        message.attach(Helpers.tmpPath(`uploads/${file.file}`), {
          filename: file.name
        })
      }
    }
  )
}
