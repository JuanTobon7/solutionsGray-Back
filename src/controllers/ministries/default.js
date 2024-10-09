const serviceDefault = require('../../services/ministries/default')
const moment = require('moment-timezone')

// cambiar funcion para poder elegir a quien asignar la oveja
exports.registerSheeps = async (req, res) => {
  try {
    console.log('req.body here in registerSheeps', req.body)
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
    console.log('aqui toi en mySheeps', id, churchId)
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

exports.getSheepsByServant = async (req, res) => {
  try {
    const { servantId } = req.params
    const { churchId } = req.user
    if (!servantId) {
      res.status(400).send('No se pudo acceder a las credenciales')
      return
    }

    const result = await serviceDefault.getSheepsByServant({ servantId, churchId })
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
    console.log('result here in controller', result)
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
      res.status(400).send({ message: 'No se pudo acceder a las credenciales' })
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

exports.getTypesPeople = async (req, res) => {
  try {
    console.log('coming here types')
    const result = await serviceDefault.getTypesPeople()
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

exports.getTypesContributions = async (req, res) => {
  try {
    console.log('coming here types')
    const result = await serviceDefault.getTypesContributions()
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

exports.saveContribution = async (req, res) => {
  try {
    console.log('req.body here in saveContribution', req.body)
    const { personId, eventId, currencyId, offerings } = req.body
    if (!personId || !eventId || !currencyId || !offerings) {
      res.status(400).send('Faltan datos para registrar la contribución')
      return
    }
    let result = await serviceDefault.saveContributions({ personId, eventId, currencyId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    const contributionId = result.id
    const saveDetails = async () => {
      for (let i = 0; i < offerings.length; i++) {
        const { type, amount } = offerings[i]
        result = await serviceDefault.saveDetailsContributions({ contributionId, type, amount })
      }
    }
    saveDetails()

    res.status(200).send({ message: 'Se ha registrado exitosamente la contribución' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.registerAttends = async (req, res) => {
  try {
    console.log('req.body here in registerAttendance', req.body)
    const { personId, eventId } = req.body
    if (!personId || !eventId) {
      res.status(400).send('Faltan datos para registrar la asistencia')
      return
    }
    console.log('im goin yujuu', personId, eventId)
    const result = await serviceDefault.registerAttends({ personId, eventId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha registrado exitosamente la asistencia' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getAttendance = async (req, res) => {
  try {
    const { eventId } = req.params
    if (!eventId) {
      res.status(400).send('Faltan datos para obtener la asistencia')
    }
    const result = await serviceDefault.getAttendance(eventId)
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

exports.deleteAttendance = async (req, res) => {
  try {
    const { personId, eventId } = req.params
    if (!personId || !eventId) {
      res.status(400).send('Faltan datos para eliminar la asistencia')
    }
    const result = await serviceDefault.deleteAttendance({ personId, eventId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha eliminado exitosamente la asistencia' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getOfferings = async (req, res) => {
  try {
    const { eventId } = req.params
    if (!eventId) {
      res.status(400).send('Faltan datos para obtener las ofrendas')
    }
    const result = await serviceDefault.getOfferings(eventId)
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
