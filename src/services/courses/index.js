const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.getMyCourses = async (studentId) => {
  const query = `
    SELECT 
      c.name,
      c.description,
      c.publisher,
      sc.status,
      sc.student_id,
      sc.teachers_courses_id,
      tc.course_id,
      COUNT(ch.*) as cuantity_chapters,
      COUNT(DISTINCT(satt.chapter_id)) as progress
    FROM students_courses sc
    JOIN teachers_courses tc ON tc.id = sc.teachers_courses_id
    JOIN courses c ON c.id = tc.course_id
    JOIN chapters_courses ch ON ch.course_id = c.id
    LEFT JOIN students_attendance satt ON satt.chapter_id = ch.id
    WHERE sc.student_id = $1
    GROUP BY c.name,c.description,c.publisher,sc.status,sc.student_id,sc.teachers_courses_id,tc.course_id;

  `
  const result = await db.query(query, [studentId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener tus cursos')
  }
  return result.rows
}

exports.registerCourses = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = 'SELECT * FROM courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = 'INSERT INTO courses (id,name,publisher,description,church_id) VALUES ($1,$2,$3,$4,$5) RETURNING *;'
  result = await db.query(query, [id, data.name, data.publisher, data.description, data.churchId])

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
  result = await db.query(query, [id, data.numbChapter, data.courseId, data.title])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar el capitulo en nuestra base de datos')
  }

  return result.rows[0]
}

exports.getCourses = async (churchId) => {
  const query = `
    SELECT c.*,COUNT(ch.id) AS cuantity_modules,COUNT(DISTINCT(sa.chapter_id)) AS cuantity_classes FROM courses c
    JOIN chapters_courses ch ON  ch.course_id = c.id
    LEFT JOIN students_attendance sa ON sa.chapter_id = ch.id
    WHERE c.church_id = $1
    GROUP BY c.id;
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los cursos')
  }
  return result.rows
}

exports.getChaptersCourses = async (courseId) => {
  const query = `
    SELECT * FROM chapters_courses WHERE course_id = $1 ORDER BY numb_chapter ASC;
  `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los capitulos del curso')
  }
  return result.rows
}

exports.assignCourses = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = 'SELECT * FROM teachers_courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)
  const status = 'En progreso'
  query = `INSERT INTO teachers_courses (id,course_id,teacher_id,status)
            VALUES ($1,$2,$3,$4)
            RETURNING *
        `
  result = await db.query(query, [id, data.courseId, data.teacherId, status])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al asignar el curso a tal profesor en nuestra Base de datos')
  }

  return result.rows[0]
}

exports.saveShedulesCourses = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = 'SELECT * FROM schedules WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)
  query = `
    INSERT INTO schedules (id,teacher_course_id,day,start_time,end_time)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *;
  `
  result = await db.query(query, [id, data.teacherCourseId, data.day, data.startTime, data.endTime])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al guardar el horario en nuestra base de datos')
  }

  return result.rows[0]
}

exports.getShedulesCourses = async (courseId) => {
  const query = `
    SELECT
      sh.*,
      p.first_name,
      p.last_name 
    FROM teachers_courses tc 
    JOIN schedules sh ON tc.id = sh.teacher_course_id
    JOIN people p ON tc.teacher_id = p.id
    WHERE course_id = $1;
  `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay horarios por mostrar')
  }
  return result.rows
}

exports.sheduleCourses = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = 'SELECT * FROM students_courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = `
    INSERT INTO students_courses (id,student_id,teachers_courses_id,status)
    VALUES ($1,$2,$3,$4)
    RETURNING *;
  `
  const status = 'En progreso'
  result = await db.query(query, [id, data.studentId, data.teacherCourseId, status])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al guardar tu inscripcion en nuestra base de datos')
  }

  return result.rows[0]
}

exports.getCoursesInCharge = async (teacherId) => {
  const query = `
    SELECT 
      tc.id AS teacher_course_id,
      c.id AS course_id,
      c.name,
      c.description,
      c.publisher,
      tc.status as status_course,
      COUNT(DISTINCT sc.student_id) AS cuantity_students,
      COUNT(DISTINCT ch.id) AS cuantity_chapters      
  FROM teachers_courses tc
  JOIN courses c ON tc.course_id = c.id
  LEFT JOIN students_courses sc ON tc.id = sc.teachers_courses_id
  LEFT JOIN students_attendance sa ON sc.student_id = sa.student_id
  JOIN chapters_courses ch ON c.id = ch.course_id
  WHERE tc.teacher_id = $1
  GROUP BY 
      tc.id, 
      c.id, 
      c.name, 
      c.description, 
      c.publisher,
      tc.status;
  `
  const result = await db.query(query, [teacherId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los cursos que tienes a cargo')
  }
  return result.rows
}

exports.getStudentsCourse = async (courseId) => {
  console.log('courseId in service', courseId)
  const query = `
    SELECT 
      p.id,
      st.id as student_course_id,
      p.first_name,
      p.last_name,
      p.email,
      p.avatar,
      p.phone,
      st.status
    FROM people p 
    JOIN students_courses st ON st.student_id = p.id
    JOIN teachers_courses tc ON st.teachers_courses_id = tc.id
    WHERE tc.id = $1;
      `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los estudiantes de este curso')
  }
  return result.rows
}

exports.getAttendanceCourse = async (courseId) => {
  console.log('courseId in service in getAttendaceCOurse', courseId)
  const query = `
    SELECT 
      sa.id,
      sa.student_id,
      sa.chapter_id,
      ch.numb_chapter,
      sa.date
    FROM students_courses sc 
    JOIN students_attendance sa ON sa.student_id = sc.id
    JOIN chapters_courses ch ON sa.chapter_id = ch.id
    WHERE sc.teachers_courses_id = $1
    ORDER BY ch.numb_chapter ASC;
  `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener la asistencia de los estudiantes')
  }
  return result.rows
}

exports.registerAttendanceCourse = async (data) => {
  let query, result, id
  do {
    id = uuidv4()
    query = 'SELECT * FROM students_attendance WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = `
    INSERT INTO students_attendance (id,student_id,chapter_id,date)
    VALUES ($1,$2,$3,$4)
    RETURNING *;
  `
  console.log('data', data)
  result = await db.query(query, [id, data.studentId, data.chapterId, data.date])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la asistencia')
  }
  return result.rows[0]
}

exports.deleteAttendanceCourse = async (attenId) => {
  console.log('attenId', attenId)
  const query = 'DELETE FROM students_attendance WHERE id = $1 RETURNING *;'
  const result = await db.query(query, [attenId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al eliminar la asistencia')
  }
  console.log('result', result.rows[0])
  return result.rows[0]
}

exports.enrrollNoUsersInCourse = async (data) => {
  let query, result, id
  do {
    id = uuidv4()
    query = 'SELECT * FROM students_courses WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length !== 0)

  query = `
    INSERT INTO students_courses (id,student_id,teachers_courses_id,status)
    VALUES ($1,$2,$3,$4)
    RETURNING *;
  `
  const status = 'En progreso'
  result = await db.query(query, [id, data.personId, data.courseId, status])

  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al inscribir al estudiante en el curso')
  }

  return result.rows[0]
}

exports.stadisticAttendanceCourse = async (courseId) => {
  const query = `
    SELECT 
      sc.student_id,
      COUNT(sa.id) as cuantity_attendance,
      (SELECT COUNT(DISTINCT(sa.date)) FROM students_attendance sa JOIN students_courses sc ON sc.id = sa.student_id  WHERE sc.teachers_courses_id = $1) as cuantity_classes
    FROM students_courses sc
    JOIN students_attendance sa ON sc.id = sa.student_id
    JOIN chapters_courses ch ON sa.chapter_id = ch.id
    WHERE sc.teachers_courses_id = $1
    GROUP BY sc.student_id
    ORDER BY cuantity_attendance ASC;
  `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener la estadistica de asistencia')
  }
  return result.rows
}

exports.evaluateStudent = async (data) => {
  console.log('data', data)
  const query = `
    UPDATE students_courses SET status = $1 WHERE student_id = $2 RETURNING *;
  `
  const result = await db.query(query, [data.status, data.studentId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al evaluar al estudiante')
  }
  return result.rows[0]
}

exports.getPeopleCourses = async (personId) => {
  const query = `
  SELECT 
  c.name,
  st.status
  FROM students_courses st
  JOIN teachers_courses tc ON st.teachers_courses_id = tc.id
  JOIN courses c ON tc.course_id = c.id
  WHERE st.student_id = $1;
  `
  const result = await db.query(query, [personId])
  if (result.rows.length === 0) {
    return new Error('Ups no pudimos obtener los cursos')
  }
  return result.rows
}

exports.finishCourse = async (courseId) => {
  const query = `
    UPDATE teachers_courses SET status = 'Finalizado' WHERE id = $1 RETURNING *;
  `
  const result = await db.query(query, [courseId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al finalizar el curso')
  }
  return result.rows[0]
}

exports.getStadisticsPeopleCourse = async (data) => {
  console.log('data', data)
  const query = `
    SELECT
        COUNT(DISTINCT st.student_id) AS quantity_students,
        COUNT(DISTINCT tc.teacher_id) AS quantity_teachers,
        (
        SELECT COUNT(DISTINCT(st.id)) FROM students_courses st 
        JOIN people p ON st.student_id = p.id        
        WHERE st.status = 'Aprobado' OR st.status = 'En Proceso'
        AND p.church_id = $1
        ) AS quantity_active_students      
    FROM students_courses st
    JOIN teachers_courses tc ON st.teachers_courses_id = tc.id
    JOIN courses c ON tc.course_id = c.id
    JOIN chapters_courses ch ON c.id = ch.course_id
    JOIN students_attendance sa ON sa.chapter_id = ch.id
    WHERE c.church_id = $1 AND sa.date BETWEEN $2 AND $3;
     
  `
  const result = await db.query(query, [data.churchId, data.minDate, data.maxDate])
  console.log('result getStadisticsPeopleCourse', result.rows)
  if (result.rows.length === 0) {
    return new Error('No hay informacion que mostrar')
  }
  return result.rows[0]
}

exports.cancelCourse = async (data) => {
  try {
    console.log('data in cancelCourse', data)
    const query = `
    DELETE FROM students_courses WHERE student_id = $1 AND teachers_courses_id = $2 RETURNING *;
    `
    const result = await db.query(query, [data.studentCourseId, data.courseId])
    if (result.rows.length === 0) {
      return new Error('Ups algo paso')
    }
    return result.rows[0]
  } catch (e) {
    console.log('error', e)
  }
}
