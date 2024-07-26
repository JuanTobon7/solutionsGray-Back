const serviceUser = require('../services/user')

exports.findById = async (id) => {
  if (!id) {
    return new Error('dato faltante')
  }

  const result = await serviceUser.findById(id)
  if (!result) {
    return new Error('Error: ', result)
  }

  return result
}
