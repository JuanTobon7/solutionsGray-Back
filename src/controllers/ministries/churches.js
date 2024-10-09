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
exports.asignServices = async (req, res) => {
  try {
    console.log('\n\n\n\nassign services controller begin\n\n\n\n\n\n')
    const servicesAssigned = req.body
    console.log('servicesAssigned', servicesAssigned, '\n\n\n\n\n\n')
    if (!servicesAssigned) {
      res.status(400).send('Ups faltan datos')
      return
    }

    // Función para validar los campos obligatorios
    const validateService = (service) => {
      for (const item of service.assignedServices) {
        console.log('Validating service item', item)
        if (!item.personId || !item.rolService) {
          return 'Missing personId or rolService'
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
        console.log('Validation error encountered')
        return { error: validationError }
      }
      console.log('Passed validateService')

      // Procesamos todos los servicios dentro de assignedServices
      for (const assignedService of service.assignedServices) {
        const data = {
          servantId: assignedService.personId,
          rolServantId: assignedService.rolService,
          eventId: service.id
        }
        console.log('Data to assign service function', data)
        const result = await serviceChurch.assignServices(data)
        console.log('Result after assigning service', result)
        if (result instanceof Error) {
          return { error: result.message }
        }
      }

      return { success: true }
    }

    // Procesar si es un array o un único servicio
    const services = Array.isArray(servicesAssigned) ? servicesAssigned : [servicesAssigned]
    console.log('services process', services)

    // Iterar sobre los servicios
    for (const service of services) {
      console.log('Validating and processing service')
      const { error } = await processService(service)
      if (error) {
        res.status(400).send({ message: error })
        return
      }
    }

    res.status(200).send({ message: 'El servicio fue asignado correctamente' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.updateAssignedService = async (req, res) => {
  try {
    console.log('Hi im update assinged service', req.body)
    const { service, eventId, person, serviceId } = req.body
    if (!service || !eventId || !person || !serviceId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    console.log('assignedServices')
    const result = await serviceChurch.updateAssignedService({ rolServantId: service.id, eventId, servantId: person.id, serviceId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha actualizado correctamente el servicio' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.deleteAssignedService = async (req, res) => {
  try {
    const { serviceId } = req.params
    console.log('\n\n\nreq.body', req.params, '\n\n\n')
    if (!serviceId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceChurch.deleteAssignedService(serviceId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha eliminado correctamente el servicio' })
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
