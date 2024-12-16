const serviceDefault = require('../../services/ministries/default')

exports.createRolesServants = async (req, res) => {
  try {
    console.log('here roles servants')
    const name = req.body.name
    if (!name) {
      res.status(400).send({ message: 'Faltan Datos' })
      return
    }
    console.log('name', name)
    const result = await serviceDefault.createRolesServants(name)
    if (result instanceof Error) {
      res.status(400).send({ message: `Ups algo paso ${result.message}` })
      return
    }

    res.status(200).send({ message: `El rol ha sido correctamente creado ${result.name}` })
  } catch (e) {
    res.status(500).send({ message: e })
  }
}
// cambiar funcion para poder elegir a quien asignar la oveja

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
        const result = await serviceDefault.assignServices(data)
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
    const result = await serviceDefault.getServices(eventId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send({ message: e })
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
    const result = await serviceDefault.updateAssignedService({ rolServantId: service.id, eventId, servantId: person.id, serviceId })
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
    const result = await serviceDefault.deleteAssignedService(serviceId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha eliminado correctamente el servicio' })
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.checkQualified = async (req, res) => { // INTENTANDO HACER SIN EVENTID
  try {
    const userId = req.user.id
    const churchId = req.user.churchId
    if (!userId || !churchId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceDefault.checkQualified({ userId, churchId })
    if (result instanceof Error) {
      res.status(400).send({ message: 'No ha calificado', id: result.message })
      return
    }
    res.status(200).send({ message: 'Califico', result })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.qualifyService = async (req, res) => {
  try {
    console.log('req.body', req.body)
    const { serviceId, qualification } = req.body
    const userId = req.user.id
    if (!userId || !serviceId || !qualification) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceDefault.qualifyService({ userId, serviceId, qualification })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha calificado correctamente el servicio' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getServantsAverageRating = async (req, res) => {
  try {
    const { typeServiceId } = req.params
    const { churchId } = req.user
    if (!typeServiceId || !churchId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceDefault.getAverageRating({ typeServiceId, churchId })
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

exports.getAverageRatingByServant = async (req, res) => {
  try {
    const { personId } = req.params
    if (!personId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceDefault.getAverageRatingByServant(personId)
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

exports.getRatingByServant = async (req, res) => {
  try {
    const { servantId } = req.params
    if (!servantId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceDefault.getRatingByServant(servantId)
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
