const serviceCourses = require('../../services/courses')

exports.registerCourses = async (req, res) => {
  try {
    const { name, publisher, description } = req.body
    const churchId = req.user.churchId
    if (!name || !publisher || !description) {
      res.status(400).send('Faltan datos para registrar el curso en cuestion')
      return
    }

    const result = await serviceCourses.registerCourses({ name, publisher, description, churchId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result', result)
    res.status(200).send({ message: 'Curso registrado exitosamente', data: result })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id
    const result = await serviceCourses.getMyCourses(studentId)
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

exports.registerChaptersCourses = async (req, res) => {
  try {
    const { chapters, courseId } = req.body
    console.log('chapters', chapters, courseId)
    if (!chapters || !courseId) {
      res.status(400).send('Ups faltan datos para registrar los capitulos del curso')
      return
    }
    for (const chapter of chapters) {
      const { numbChapter, title } = chapter
      if (!numbChapter || !title) {
        res.status(400).send('Ups faltan datos para registrar los capitulos del curso')
        return
      }
      const result = await serviceCourses.registerChaptersCourses({ numbChapter, title, courseId })
      if (result instanceof Error) {
        res.status(400).send({ message: result.message })
        return
      }
    }
    res.status(200).send({ message: 'Capitulos registrados exitosamente' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getCourses = async (req, res) => {
  try {
    const churchId = req.user.churchId
    const result = await serviceCourses.getCourses(churchId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send('Ups algo paso en el servidor,', e)
  }
}

exports.assignCourses = async (req, res) => {
  try {
    const { courseId, teacherId } = req.body
    console.log('req.body', req.body)
    if (!courseId || !teacherId) {
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }

    const result = await serviceCourses.assignCourses({ teacherId, courseId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send({ message: 'Se ha asignado exitosamente este curso', ...result })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.saveShedulesCourses = async (req, res) => {
  try {
    const { teacherCourseId, schedules } = req.body
    console.log('req.body', req.body)
    if (!teacherCourseId || !schedules) {
      console.log('aqui toi')
      res.status(400).send('Ups faltan datos para esta operacion')
      return
    }
    for (const schedule of schedules) {
      const { day, startTime, endTime } = schedule
      if (!day || !startTime || !endTime) {
        console.log('schedule', schedule)
        res.status(400).send('Ups faltan datos para esta operacion')
        return
      }
      const result = await serviceCourses.saveShedulesCourses({ teacherCourseId, day, startTime, endTime })
      if (result instanceof Error) {
        res.status(400).send({ message: result.message })
        return
      }
    }
    res.status(200).send({ message: 'Horarios guardados exitosamente' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.sheduleCourses = async (req, res) => {
  try {
    console.log('here here', req.body)
    const { teacherCourseId } = req.body
    const studentId = req.body.studentId ? req.body.studentId : req.user.id
    if (!teacherCourseId || !studentId) {
      res.status(400).send('Ups no proporcionaste el curso al cual quieres inscribirte')
      return
    }
    const result = await serviceCourses.sheduleCourses({ teacherCourseId, studentId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send({ message: 'Haz sido inscrito exitosamente a este curso' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getChaptersCourses = async (req, res) => {
  try {
    const { courseId } = req.params
    if (!courseId) {
      res.status(400).send('Ups faltan datos para realizar esta operacion')
      return
    }
    const result = await serviceCourses.getChaptersCourses(courseId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result', result)
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getShedulesCourses = async (req, res) => {
  try {
    const { courseId } = req.params
    if (!courseId) {
      res.status(400).send('Ups faltan datos para realizar esta operacion')
      return
    }
    const result = await serviceCourses.getShedulesCourses(courseId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result', result)
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getCoursesInCharge = async (req, res) => {
  try {
    console.log('aqui toi en getMyCourses')
    const teacherId = req.user.id
    const result = await serviceCourses.getCoursesInCharge(teacherId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result', result)
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getStudentsCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    console.log('courseId', courseId)
    if (!courseId) {
      res.status(400).send('Ups faltan datos para realizar esta operacion')
      return
    }
    const result = await serviceCourses.getStudentsCourse(courseId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result', result)
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
