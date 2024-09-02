const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.createChurches = async (data) => {
  let churchId, result, query
  do {
    churchId = uuidv4()
    result = await db.query('SELECT * FROM churches WHERE id = $1', [churchId])
  } while (result.rows.length > 0)
  query = `
        INSERT INTO churches (id,name,parent_church_id,address,state_id) 
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *;`
  console.log(churchId)
  result = await db.query(query, [churchId, data.name, data.parentChurchId, data.address, data.stateId])
  const resultChurch = result.rows[0]
  if (result.rows.length === 0) {
    return new Error('Ups algo paso al registrar tu iglesia')
  }

  query = 'INSERT INTO church_pastor (pastor_id,church_id) VALUES ($1,$2) RETURNING *;'
  result = await db.query(query, [data.pastorId, churchId])

  const updateQuery = `
        UPDATE people 
        SET church_id = $1 
        WHERE id = $2
        RETURNING *;
    `
  const updateResult = await db.query(updateQuery, [churchId, data.pastorId])

  if (updateResult.rows.length === 0) {
    return new Error('Ups algo paso al actualizar el church_id en la tabla servants')
  }

  return resultChurch
}

exports.getTypesWorshipServices = async () => {
  const query = 'SELECT * FROM types_whorship_service;'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('No hay tipos de cultos')
  }
  return result.rows
}

exports.createWorshipServices = async (data) => {
  let query, result, id
  do {
    id = uuidv4()
    query = 'SELECT * FROM events WHERE id = $1;'
    result = await db.query(query, [id])
  } while (result.rows.length > 0)
  query = 'INSERT INTO events (id,worship_service_type_id,date,church_id,sermon_tittle,description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;'
  console.log('data in createWorshipServices: ', data)
  result = await db.query(query, [id, data.typeWorshipId, data.dateWhorship, data.churchId, data.sermonTittle, data.description])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al guardar el culto')
  }

  return result.rows[0]
}

exports.getWorshipServices = async (churchId) => {
  const query = 'SELECT * FROM events WHERE church_id = $1;'
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('No hay cultos programados')
  }
  return result.rows
}

exports.createRolesServants = async (name) => {
  try {
    console.log('name in create roles servants: ', name)
    let query, result, id
    do {
      id = uuidv4()
      console.log('id in create roles servants: ', id)
      query = 'SELECT * FROM roles_services WHERE id = $1;'
      result = await db.query(query, [id])
      console.log('result in create roles servants: ', result)
    } while (result.rows.length > 0)
    console.log('id in create roles servants: ', id)
    query = 'INSERT INTO roles_services (id,name) VALUES ($1,$2) RETURNING *;'
    result = await db.query(query, [id, name])
    console.log('result in create roles servants: ', result)
    if (result.rowCount.length === 0) {
      return new Error('Ups algo fallo al guardar el rol para servidor')
    }

    return result.rows[0]
  } catch (e) {
    console.log(e)
    return e
  }
}

exports.assignServices = async (data) => {
  try {
    // Consulta para verificar la cuenta de servicios y roles
    const queryCheckServiceCount = `
            SELECT 
                COUNT(sr.servant_id) AS service_count
            FROM services sr
            JOIN events e ON sr.event_id = e.id
            WHERE sr.servant_id = $1 AND e.id = $2
            GROUP BY sr.servant_id;
        `
    const resultCheckServiceCount = await db.query(queryCheckServiceCount, [data.servantId, data.eventId])

    if (resultCheckServiceCount.rows.length !== 0) {
      const serviceCount = parseInt(resultCheckServiceCount.rows[0].service_count, 10)

      if (serviceCount >= 2) {
        throw new Error('El servidor ya tiene más de dos servicios asignados para esta fecha')
      }
    }

    // Verificar si el rol del servidor ya está asignado para este evento
    const queryCheckRole = `
            SELECT 
                sr.id
            FROM services sr
            WHERE sr.servant_id = $1 AND sr.event_id = $2 AND sr.rol_servant_id = $3
        `
    const resultCheckRole = await db.query(queryCheckRole, [data.servantId, data.eventId, data.rolServantId])

    if (resultCheckRole.rows.length > 0) {
      throw new Error('El servidor ya tiene asignado ese rol en esta fecha')
    }
    // Asignación de un nuevo servicio
    const id = uuidv4()

    const queryInsert = `
            INSERT INTO services (id, servant_id, rol_servant_id, event_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `
    const resultInsert = await db.query(queryInsert, [id, data.servantId, data.rolServantId, data.eventId])

    if (resultInsert.rows.length === 0) {
      throw new Error('Ups algo fallo al asignar el servicio')
    }

    // Consulta para obtener detalles del servicio asignado
    const queryDetails = `
            SELECT 
                s.name AS servant_name,
                s.email AS servant_email,
                r.name AS rol_servant_name,
                c.name AS church_name,
                e.date,
                e.name AS event_name
            FROM 
                servants s
            JOIN 
                services sr ON s.id = sr.servant_id
            JOIN
                roles_servants r ON r.id = sr.rol_servant_id
            JOIN 
                churches c ON c.id = s.church_id
            JOIN 
                events e ON e.id = sr.event_id
            WHERE 
                sr.id = $1;
        `
    const resultDetails = await db.query(queryDetails, [id])

    if (resultDetails.rows.length === 0) {
      throw new Error('Ups algo fallo al asignar el servicio')
    }

    return resultDetails.rows[0]
  } catch (e) {
    console.log(e)
    return e
  }
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

exports.getChurchInfo = async (churchId) => {
  console.log(`churchId: ${churchId}`)
  const query = `
     SELECT 
        ch.name,
        ch.address,
        ch.state_id AS stateId,
        COUNT(DISTINCT g.id) AS quantityGroups,
        SUM(CASE WHEN tp.name = 'Invitado' THEN 1 ELSE 0 END) AS countInvitado,
        SUM(CASE WHEN tp.name = 'Usuario' THEN 1 ELSE 0 END) AS countUsuario,
        SUM(CASE WHEN tp.name = 'Nuevo' THEN 1 ELSE 0 END) AS countNuevo,
        SUM(CASE WHEN tp.name = 'Oveja' THEN 1 ELSE 0 END) AS countOveja
    FROM churches ch
    LEFT JOIN people p ON ch.id = p.church_id
    LEFT JOIN group_churches g ON ch.id = g.church_id
    LEFT JOIN types_people tp ON p.type_person_id = tp.id
    WHERE ch.id = $1
    GROUP BY ch.name, ch.address, ch.state_id;

  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('No hay informacion que mostrar')
  }
  console.log('resultado de church', result.rows[0])
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
