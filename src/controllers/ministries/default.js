const serviceDefault = require('../../services/ministries/default')
const moment = require('moment-timezone')

exports.registerAttends = async (req, res) => {
  try {
    const { countryId, churchId, id: guideId } = req.user

    console.log('ID del guía:', guideId)
    const { cc, name, email, eventId } = req.body
    if (!cc || !name || !eventId) {
      res.status(400).send('Faltan Datos')
      return
    }
    const result = await serviceDefault.registerAttends({ cc, name, email, eventId, countryId, churchId, guideId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(`La persona ${result.name} fue añadida exitosamente`)
  } catch (e) {
    console.log(e)
    res.status(500).send('Error en el servidor', e)
  }
}

exports.registerSheeps = async (req, res) => {
  try {
    const { attendeeId, description } = req.body
    const guideId = req.user.id
    if (!attendeeId || !description) {
      res.status(400).send('Faltan datos para iniciar un proceso de acompañamiento con la persona en cuestion')
      return
    }

    const result = await serviceDefault.registerSheep({ attendeeId, description, guideId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }

    res.status(200).send('Se ha iniciado un proceso de acompañamiento con la persona inscrita')
  } catch (e) {
    console.log(e)
    res.status(500).send('Ups algo fallo en el servidor', e)
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
    res.status(500).send('Ups algo fallo en el servidor', e)
  }
}
