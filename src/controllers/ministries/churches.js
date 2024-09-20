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

    const { typeWorshipId, sermonTittle, description, date, timeZone } = req.body

    // Validar que todos los datos requeridos estén presentes
    if (!typeWorshipId || !sermonTittle || !description || !date || !timeZone) {
      console.log('Datos incompletos')
      res.status(400).send('Datos incompletos')
      return
    }

    const churchId = req.user.churchId

    // No realizar ninguna conversión de zona horaria, simplemente usamos la fecha que proporcionó el usuario
    const eventDateInUserTZ = moment(date) // Usar la fecha tal como la envió el usuario
    const currentDateInUserTZ = moment().tz(timeZone) // Fecha actual en el servidor (no afecta al evento)

    // Calcula la diferencia en días entre la fecha del culto y la fecha actual
    const daysDifference = eventDateInUserTZ.diff(currentDateInUserTZ, 'days')

    // Validar que la diferencia de días sea mayor o igual a 4
    if (daysDifference < 4) {
      res.status(400).send({ message: 'No se pueden programar cultos con menos de 4 días de anterioridad' })
      return
    }

    // Almacenar la fecha tal cual la ingresó el usuario (sin convertir a UTC)
    const dateWhorship = eventDateInUserTZ.format('YYYY-MM-DD HH:mm')

    // Debug para verificar que se almacena la fecha correctamente
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
    res.status(200).send({ message: 'Culto creado exitosamente', id: result.id })
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
    console.log('assign services controller begin')
    const servicesAssigned = req.body
    console.log('servicesAssigned', servicesAssigned)
    if (!servicesAssigned) {
      res.status(400).send('Ups faltan datos')
      return
    }

    // Función para validar los campos obligatorios
    const validateService = (servicesAssigned) => {
      for (const service in servicesAssigned) {
        console.log('im in the service loop', service)
        if (!service.personId || !service.rolService) {
          return null
        }
      }

      return null
    }
    console.log('here')
    // Función para asignar y validar un servicio
    const processService = async (service) => {
      console.log('service in processService: ', service)
      const validationError = validateService(service)
      if (validationError) {
        console.log('y se cansan')
        return { error: validationError }
      }
      console.log('Hasta aqui hemos llegado pasado el validateService')
      console.log()
      const data = { servantId: service.assignedServices[0].personId, rolServantId: service.assignedServices[0].rolService, eventId: service.id }
      console.log('data to te assingService fun', data)
      const result = await serviceChurch.assignServices(data)
      console.log('vamos ahora aquiiiii con result', result)
      if (result instanceof Error) {
        return { error: result.message }
      }

      return { success: true }
    }

    // Procesar si es un array o un único servicio
    const services = Array.isArray(servicesAssigned) ? servicesAssigned : [servicesAssigned]

    // Iterar sobre los servicios
    for (const service of services) {
      console.log('procedemos a validar si es cosas o q')
      const { error } = await processService(service)
      if (error) {
        res.status(400).send({ message: error })
        return
      }
    }

    // se creara un curso
    // // const emailResult = await serviceEmail.sendAssignedService(result)
    // // if(emailResult instanceof Error){
    // //     throw emailResult.message
    // //     return
    // // }

    res.status(200).send({ message: 'El servicio fue asignado correctamente' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.updateAssignedService = async (req, res) => {
  try {
    const { assignedServices, id: eventId } = req.body
    if (!assignedServices || !eventId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceChurch.updateAssignedService({ assignedServices, eventId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }
    res.status(200).send({ message: 'Se ha actualizado correctamente el servicio' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getServices = async (req, res) => {
  try {
    console.log('im here in getServices')
    console.log('request', req.params)
    const { id: eventId } = req.params
    console.log('eventId', eventId)
    if (!eventId) {
      res.status(400).send('Faltan datos para esta operacion')
      return
    }
    const result = await serviceChurch.getServices(eventId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send({ message: e })
  }
}

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
