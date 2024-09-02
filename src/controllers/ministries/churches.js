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

    const { typeWorshipId, sermonTittle, description, date, userTimezone } = req.body
    if (!typeWorshipId || !sermonTittle || !description || !date || !userTimezone) {
      res.status(400).send('Datos incompletos')
      return
    }

    const churchId = req.user.churchId

    // Convierte la fecha proporcionada a la zona horaria del usuario
    const eventDateInUserTZ = moment.tz(date, userTimezone)

    // Calcula la fecha actual en la zona horaria del usuario
    const currentDateInUserTZ = moment.tz(new Date(), userTimezone)

    // Calcula la diferencia en días entre la fecha del culto y la fecha actual
    const daysDifference = eventDateInUserTZ.diff(currentDateInUserTZ, 'days')

    if (daysDifference < 4) {
      res.status(400).send({ message: 'No se pueden programar cultos con menos de 4 días de anterioridad' })
      return
    }

    // Guarda la fecha en la base de datos en formato UTC para evitar problemas de zona horaria
    const dateWhorship = eventDateInUserTZ.utc().format('YYYY-MM-DD HH:mm')

    console.log('dateWhorship', dateWhorship)

    const result = await serviceChurch.createWorshipServices({
      typeWorshipId,
      sermonTittle,
      dateWhorship,
      churchId,
      description
    })

    if (result instanceof Error) {
      res.status(400).send({ message: `Ups, hubo un error: ${result.message}` })
      return
    }

    // Enviar un correo electrónico para notificar la creación del culto (implementar esto)
    res.status(200).send({ message: 'Culto creado exitosamente' })
  } catch (e) {
    res.status(500).send({ message: `Ups, hubo un error: ${e}` })
  }
}
exports.getWorshipServices = async (req, res) => {
  try {
    const churchId = req.user.churchId
    const result = await serviceChurch.getWorshipServices(churchId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send({ message: e })
  }
}

exports.createRolesServants = async (req, res) => {
  try {
    console.log('here roles servants')
    const name = req.body.name
    if (!name) {
      res.status(400).send({ message: 'Faltan Datos' })
      return
    }
    console.log('name', name)
    const result = await serviceChurch.createRolesServants(name)
    if (result instanceof Error) {
      res.status(400).send({ message: `Ups algo paso ${result.message}` })
      return
    }

    res.status(200).send({ message: `El rol ha sido correctamente creado ${result.name}` })
  } catch (e) {
    res.status(500).send({ message: e })
  }
}
// añadimos servicios o privilegios para los servidores de la iglesia
exports.assignServices = async (req, res) => {
  try {
    console.log('assing services controller begin')
    const { servantId, rolServantId, eventId } = req.body

    if (!rolServantId || !eventId || !servantId) {
      res.status(400).send('Ups faltan datos')
      return
    }

    const result = await serviceChurch.assignServices({ rolServantId, eventId, servantId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    // // const emailResult = await serviceEmail.sendAssignedService(result)
    // // if(emailResult instanceof Error){
    // //     throw emailResult.message
    // //     return
    // // }
    res.status(200).send({ message: 'el servicio fue asignado correctamente' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

// se creara un curso
exports.registerCourses = async (req, res) => {
  try {
    const { name, publisher, description } = req.body
    if (!name || !publisher || !description) {
      res.status(400).send('Faltan datos para registrar el curso en cuestion')
    }

    const result = await serviceChurch.registerCourses({ name, publisher, description })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(`Se ha registrado exitosamente el curso ${name}`)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

// se asignara un curso recordar enviar email
exports.assignCourses = async (req, res) => {
  try {
    const { courseId, teacherId } = req.body
    const churchId = req.user.churchId
    if (!courseId || !teacherId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceChurch.assignCourses({ courseId, teacherId, churchId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send('Se ha asignado exitosamente este curso')
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

// aplicar a curso como servidor
exports.enrollServantsCourses = async (req, res) => {
  try {
    const { churchCourseId, startedAt, timeZone } = req.body
    if (!churchCourseId || !startedAt) {
      res.status(400).send('Ups no proporcionaste el curso al cual quieres inscribirte')
      return
    }
    const startedDateTZ = moment.tz(startedAt, timeZone)
    const entityColumn = 'servant_id'
    const entityId = req.user.id
    const result = await serviceChurch.enrollCourses({ churchCourseId, startedDateTZ, entityId, entityColumn })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send('Haz sido inscrito exitosamente a este curso')
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.enrollSheepsCourses = async (req, res) => {
  try {
    const { sheepId, churchCourseId, startedAt, timeZone } = req.body
    if (!sheepId || !churchCourseId || !startedAt || !timeZone) {
      res.status(400).send('Ups faltan datos para realizar esta operacion')
      return
    }
    const startedDateTZ = moment.tz(startedAt, timeZone)
    const entityColumn = 'sheep_id'
    const entityId = sheepId

    const result = await serviceChurch.enrollCourses({ entityId, entityColumn, churchCourseId, startedDateTZ })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send('Se asigno correctamente la oveja a este curso')
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getChurchInfo = async (req, res) => {
  try {
    const { churchId } = req.user
    if (!churchId) {
      throw new Error('No podemos hallar la informacion de la iglesia a la que asistes')
    }
    console.log('churchId', churchId)
    const result = await serviceChurch.getChurchInfo(churchId)
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

exports.getCourses = async (res) => {
  try {
    const result = await serviceChurch.getCourses()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send('Ups algo paso en el servidor,', e)
  }
}
