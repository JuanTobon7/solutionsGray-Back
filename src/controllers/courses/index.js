const moment = require('moment-timezone')
const serviceCourses = require('../../services/courses')

exports.registerCourses = async (req, res) => {
  try {
    const { name, publisher, description } = req.body
    if (!name || !publisher || !description) {
      res.status(400).send('Faltan datos para registrar el curso en cuestion')
    }

    const result = await serviceCourses.registerCourses({ name, publisher, description })
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

exports.getCourses = async (res) => {
  try {
    const result = await serviceCourses.getCourses()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }
  } catch (e) {
    console.log(e)
    res.status(500).send('Ups algo paso en el servidor,', e)
  }
}

exports.assignCourses = async (req, res) => {
  try {
    const { courseId, teacherId } = req.body
    const churchId = req.user.churchId
    if (!courseId || !teacherId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    const result = await serviceCourses.assignCourses({ courseId, teacherId, churchId })
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
    const result = await serviceCourses.enrollCourses({ churchCourseId, startedDateTZ, entityId, entityColumn })
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

    const result = await serviceCourses.enrollCourses({ entityId, entityColumn, churchCourseId, startedDateTZ })
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
