const serviceUser = require('../services/user')
const { upload } = require('./s3Aws') // Ajusta el path a tu archivo de configuración S3

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

exports.getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'No autorizado' })
    }
    const result = await serviceUser.getMyProfile(req.user.id)
    if (result instanceof Error) {
      return res.status(500).send({ message: result.message })
    }
    res.status(200).send(result)
  } catch (err) {
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}

exports.updatePhoto = async (req, res) => {
  try {
    // Usar multer para manejar la carga del archivo
    upload(req, res, async (err) => {
      if (err) {
        // Manejo de errores de multer
        return res.status(400).send({ message: err.message })
      }

      // Verificar si no se subió archivo
      if (!req.file) {
        return res.status(400).send({ message: 'No se subió ningún archivo.' })
      }

      // Aquí puedes actualizar la información del usuario en tu base de datos
      const userId = req.user.id // Supongo que tienes el ID del usuario en req.user.id
      const photoUrl = req.file.location // Multer-S3 guarda la URL pública en `location`

      // Simulación de actualización en base de datos
      // Reemplaza esto con tu lógica para actualizar el usuario
      const updatedUser = await serviceUser.updatePhoto({ photoUrl, userId })

      if (!updatedUser) {
        return res.status(404).send({ message: 'Usuario no encontrado.' })
      }

      res.status(200).send({
        message: 'Foto actualizada exitosamente.',
        avatar: photoUrl
      })
    })
  } catch (e) {
    res.status(500).send({ message: 'Error interno del servidor', error: e.message })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const result = await serviceUser.deleteAccount(userId)
    if (result instanceof Error) {
      return res.status(500).send({ message: result.message })
    }
    res.status(200).send({ message: 'Cuenta eliminada exitosamente' })
  } catch (e) {
    res.status(500).send({ message: 'Error interno del servidor', error: e.message })
  }
}
