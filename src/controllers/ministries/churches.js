const serviceChurch = require('../../services/ministries/churches')
const moment = require('moment-timezone')

exports.createChurches = async (req, res) => {
  try {
    const { name, parentChurchId, address, stateId } = req.body
    const pastorId = req.user.id
    console.log('pastorId', pastorId)
    if (!name || !address || !stateId) {
      res.status(400).send('Datos Incompletos')
      return
    }

    const result = await serviceChurch.createChurches({ name, parentChurchId, address, stateId, pastorId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(`La iglesia ${result.name} que pastoreas fue creada exitosamente`)
  } catch (e) {
    console.log(e)
  }
}

// Obtener la fecha actual en la zona horaria del usuario, Convertimos tambien la fecha del evento a la zona horaria del usuario,
// Verificamos si el evento es al menos 4 días en el futuro
// Creamos cultos en la iglesia, ojo son disintos a los eventos de los grupos

exports.getTypesWorshipServices = async (req, res) => {
  try {
    console.log('here get types worship services')
    const result = await serviceChurch.getTypesWorshipServices()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send({ message: e })
  }
}

exports.createWorshipServices = async (req, res) => {
  try {
    console.log('here create worship services')
    console.log('data received', req.body)

    const { typeWorshipId, sermonTittle, description, date, timeZone } = req.body

    // Validar que todos los datos requeridos estén presentes
    if (!typeWorshipId || !sermonTittle || !description || !date || !timeZone) {
      console.log('Datos incompletos')
      res.status(400).send('Datos incompletos')
      return
    }

    const churchId = req.user.churchId

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
    const result = await serviceChurch.createWorshipServices({
      typeWorshipId,
      sermonTittle,
      userDate,
      churchId,
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

exports.getWorshipServices = async (req, res) => {
  try {
    const churchId = req.user.churchId
    const { minDate, maxDate } = req.params
    if (!churchId || !minDate || !maxDate) {
      res.status(400).send('No podemos hallar la informacion de la iglesia a la que asistes')
      return
    }
    console.log('minDate', minDate)
    console.log('maxDate', maxDate)
    const result = await serviceChurch.getWorshipServices({ churchId, minDate, maxDate })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send({ message: e })
  }
}
exports.updateWorshipService = async (req, res) => {
  console.log('hello im in updateWorshipService')
  const data = req.body
  console.log('data', data)
  if (!data) {
    return res.status(400).json({ message: 'ID no proporcionado' })
  }

  // Ahora pasas el 'id' y 'data' al servicio para hacer la actualización
  try {
    const date = moment(data.date).format('YYYY-MM-DD HH:mm')
    const result = await serviceChurch.updateWorshipService(data, date)
    if (!result) {
      return res.status(404).json({ message: 'Servicio no encontrado' })
    }
    res.status(200).json({
      message: 'Servicio actualizado con éxito',
      result
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error en el servidor',
      error: error.message
    })
  }
}

exports.getStadisticPeopleChurch = async (req, res) => {
  try {
    const { churchId } = req.user
    const { minDate, maxDate } = req.params
    if (!churchId || !minDate || !maxDate) {
      throw new Error('No podemos hallar la informacion de la iglesia a la que asistes')
    }
    const result = await serviceChurch.getStadisticPeopleChurch({ churchId, minDate, maxDate })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log('error:', e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getStadisticAssistance = async (req, res) => {
  try {
    const { churchId } = req.user
    const { minDate, maxDate } = req.params
    console.log('date', minDate, maxDate)
    if (!churchId) {
      throw new Error('No podemos hallar la informacion de la iglesia a la que asistes')
    }
    const result = await serviceChurch.getStadisticAssistance({ churchId, minDate, maxDate })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log('error:', e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
