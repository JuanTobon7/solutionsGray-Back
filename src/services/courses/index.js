const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.enrollCourses = async (data) => {
  let id, result, query
  do {
    id = uuidv4()
    query = `
              SELECT * FROM entity_courses WHERE id = $1;
          `
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = 'SELECT * FROM entity_courses WHERE sheep_id = $1 OR servant_id = $1;'
  result = await db.query(query, [data.entityId])

  if (result.rows.length !== 0) {
    return new Error('Ya se ha realizado este registro anteriormente')
  }

  query = `
          INSERT INTO entity_courses (id,${data.entityColumn},started_at,course_id)
          VALUES ($1,$2,$3,$4)
          RETURNING *;
      `
  result = await db.query(query, [id, data.entityId, data.startedDateTZ, data.churchCourseId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al guardar tu inscripcion en nuestra base de datos')
  }

  return result.rows[0]
}

exports.registerCourses = async (data) => {
  let id, query, result
  console.log('data: ', data)
  do {
    id = uuidv4()
    query = 'SELECT * FROM courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = 'INSERT INTO courses (id,name,publisher,description) VALUES ($1,$2,$3,$4) RETURNING *;'
  result = await db.query(query, [id, data.name, data.publisher, data.description])
  console.log('result: ', result)
  if (result.rows.length === 0) {
    return new Error('Ups algo paso al registrar el curso')
  }

  return result.rows[0]
}

exports.registerChaptersCourses = async (data) => {
  let query, result, id
  do {
    id = uuidv4()
    query = 'SELECT * FROM chapters_courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = `
      INSERT INTO chapters_courses (id,numb_chapter,course_id,name)
      VALUES ($1,$2,$3,$4)
      RETURNING *;
  `
  result = await db.query(query, [id, data.numbChapter, data.courseId, data.name])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar el capitulo en nuestra base de datos')
  }

  return result.rows[0]
}

exports.getCourses = async () => {
  const query = 'SELECT * FROM courses;'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los cursos')
  }
  return result.rows
}

exports.assignCourses = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = 'SELECT * FROM church_courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = `INSERT INTO church_courses (id,course_id,church_id,teacher_id)
            VALUES ($1,$2,$3,$4)
            RETURNING *
        `
  result = await db.query(query, [id, data.courseId, data.churchId, data.teacherId])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al asignar el curso a tal profesor en nuestra Base de datos')
  }

  return result.rows[0]
}
