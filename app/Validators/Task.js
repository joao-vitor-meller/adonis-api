'use strict'

class Task {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      title: 'required',
      due_data: 'date'
    }
  }
}

module.exports = Task
