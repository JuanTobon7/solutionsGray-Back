const serviceDefault = require('../../services/ministries/default')
const moment = require('moment-timezone')

// cambiar funcion para poder elegir a quien asignar la oveja
exports.registerSheeps = async (req, res) => {
  try {
    const { personId, description, guideId } = req.body
    if (!personId || !description || !guideId) {
      res.status(400).send('Faltan datos para iniciar un proceso de acompañamiento con la persona en cuestion')
      return
    }

    const result = await serviceDefault.registerSheep({ personId, description, guideId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }

    res.status(200).send('Se ha iniciado un proceso de acompañamiento con la persona inscrita')
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.resgisterVisits = async (req, res) => {
  try {
    const { visitDate, description, sheepId, userTimezone } = req.body
    if (!visitDate || !description || !sheepId || !userTimezone) {
      res.status(400).send('Faltan datos para registrar la visita')
      return
    }
    const visitDateTimezone = moment.tz(visitDate, userTimezone)
    const visitDateFormat = visitDateTimezone.format('YYYY-MM-DD HH:mm')
    const result = await serviceDefault.resgisterVisits({ visitDateFormat, description, sheepId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send('Se ha registrado exitosamente la visita a la oveja en cuestion')
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getSheeps = async (req, res) => {
  try {
    console.log('coming here sheeps')
    const { churchId } = req.user
    if (!churchId) {
      throw new Error('No se pudo acceder a las credenciales')
    }

    const result = await serviceDefault.getSheeps(churchId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getSheep = async (req, res) => {
  try {
    const { id } = req.params
    const churchId = req.user.churchId
    if (!id) {
      res.status(400).send('No se pudo acceder a las credenciales')
      return
    }

    const result = await serviceDefault.getSheep({ id, churchId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getMySheeps = async (req, res) => {
  try {
    const { id } = req.user
    const { churchId } = req.user
    const result = await serviceDefault.getMySheeps({ id, churchId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getServants = async (req, res) => {
  try {
    const { churchId } = req.user
    if (!churchId) {
      throw new Error('No se pudo acceder a las credenciales')
    }
    const result = await serviceDefault.getServants(churchId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getPeople = async (req, res) => {
  try {
    const { churchId } = req.user
    if (!churchId) {
      throw new Error('No se pudo acceder a las credenciales')
    }
    const result = await serviceDefault.getPeople(churchId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getRolesServices = async (req, res) => {
  try {
    console.log('coming here roles')
    const result = await serviceDefault.getRolesServices()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
