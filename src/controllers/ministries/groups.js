const serviceGroups = require('../../services/ministries/groups')
const moment = require('moment-timezone')

exports.createGroups = async (req, res) => {
  try {
    const { latitude, longitude, name, leaderId, strategyName, description } = req.body
    const { churchId } = req.user
    console.log('here data in controller', req.body)
    if (!latitude || !longitude || !name || !leaderId || !strategyName) {
      res.status(400).send({ message: 'Faltan datos' })
      return
    }
    const response = await serviceGroups.createGroups({ latitude, longitude, name, leaderId, churchId, strategyName, description })
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getGroups = async (req, res) => {
  try {
    const { churchId } = req.user
    const response = await serviceGroups.getGroups(churchId)
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getMyInfoGroup = async (req, res) => {
  try {
    const id = req.user.id
    const response = await serviceGroups.getMyInfoGroup(id)
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getMyGroup = async (req, res) => {
  try {
    const id = req.params.groupId
    if (!id) {
      res.status(400).send({ message: 'Faltan datos' })
      return
    }
    const response = await serviceGroups.getMyGroup(id)
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getServicesGroup = async (req, res) => {
  try {
    const { groupId, minDate, maxDate } = req.params
    if (!groupId || !minDate || !maxDate) {
      res.status(400).send({ message: 'Faltan datos' })
      return
    }
    const response = await serviceGroups.getServicesGroup({ groupId, minDate, maxDate })
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.addPersonStrategie = async (req, res) => {
  try {
    const { personId, strategyId, rol, groupId } = req.body
    if (!personId || !strategyId || !rol || !groupId) {
      res.status(400).send({ message: 'Faltan datos' })
      return
    }
    const leaderId = req.body.leaderId || ''
    const response = await serviceGroups.addPersonStrategie({ personId, strategyId, rol, groupId, leaderId })
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getStrategyById = async (req, res) => {
  try {
    const { strategyId } = req.params
    if (!strategyId) {
      res.status(400).send({ message: 'Faltan datos' })
      return
    }
    const response = await serviceGroups.getStrategyById(strategyId)
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getAttendanceGroup = async (req, res) => {
  try {
    const { groupId, date } = req.params
    if (!groupId || !date) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.getAttendanceGroup({ groupId, date })
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.createWorshipServices = async (req, res) => {
  try {
    console.log('here create worship services')
    console.log('data received', req.body)

    const { typeWorshipId, sermonTittle, description, date, timeZone, groupId } = req.body

    // Validar que todos los datos requeridos estén presentes
    if (!typeWorshipId || !sermonTittle || !description || !date || !timeZone || !groupId) {
      console.log('Datos incompletos')
      res.status(400).send('Datos incompletos')
      return
    }

    const userDate = moment(date)

    // No realizar ninguna conversión de zona horaria, simplemente usamos la fecha que proporcionó el usuario
    const currentDateInUserTZ = moment().tz(timeZone) // Fecha actual en el servidor (no afecta al evento)

    // Calcula la diferencia en días entre la fecha del culto y la fecha actual
    const daysDifference = userDate.diff(currentDateInUserTZ, 'days')

    // Validar que la diferencia de días sea mayor o igual a 4
    if (daysDifference < 4) {
      console.log('holaa')
      res.status(400).send({ message: 'No se pueden programar cultos con menos de 4 días de anterioridad' })
      return
    }

    // Almacenar la fecha tal cual la ingresó el usuario (sin convertir a UTC)
    // Debug para verificar que se almacena la fecha correctamente
    const result = await serviceGroups.createWorshipServices({
      typeWorshipId,
      sermonTittle,
      userDate,
      groupId,
      description
    })

    if (result instanceof Error) {
      res.status(400).send({ message: `Ups, hubo un error: ${result.message}` })
      return
    }

    // Enviar un correo electrónico para notificar la creación del culto (implementar esto)
    res.status(200).send({ message: 'Culto creado exitosamente', id: result.id })
  } catch (e) {
    res.status(500).send({ message: `Ups, hubo un error: ${e}` })
  }
}
