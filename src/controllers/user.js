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

exports.basicInfo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'No autorizado' })
    }
    const result = await serviceUser.findById(req.user.id)
    if (result instanceof Error) {
      return res.status(500).send({ message: result.message })
    }
    const basicInfo = {
      name: result.name,
      rol: result.rolName,
      email: result.email
    }
    res.status(200).send(basicInfo)
  } catch (err) {
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}
