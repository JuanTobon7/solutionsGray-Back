const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.registerAttends = async (data) => {
  console.log('data, im here:', data, '\n\n\n\n\n')

  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM attendees WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)

  query = `
        INSERT INTO attendees (id,event_id,person_id)
        VALUES($1,$2,$3) RETURNING *;
        `
  result = await db.query(query, [id, data.eventId, data.personId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la asistencia de la persona')
  }
  return result.rows[0]
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

exports.getServants = async (churchId) => {
  const query = `
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    (SELECT rs.name
     FROM services srv
     LEFT JOIN roles_services rs ON srv.rol_servant_id = rs.id
     WHERE srv.servant_id = p.id
     GROUP BY rs.name
     ORDER BY COUNT(*) DESC
     LIMIT 1) AS usual_rol,
    (SELECT e.date 
     FROM events e
     JOIN services srv ON e.id = srv.event_id
     WHERE srv.servant_id = p.id
     ORDER BY e.date DESC
     LIMIT 1) AS last_service,
    (SELECT c.name 
     FROM courses c
     JOIN church_courses chc ON c.id = chc.course_id
     JOIN entity_courses ec ON chc.id = ec.course_id
     WHERE ec.student_id = p.id
     ORDER BY ec.started_at DESC
     LIMIT 1) AS last_course,
    (SELECT ec.status 
     FROM entity_courses ec
     WHERE ec.student_id = p.id
     ORDER BY ec.started_at DESC
     LIMIT 1) AS status_course,
    COUNT(DISTINCT sh.person_id) AS cuantity_sheeps_guide
  FROM 
    people p
  LEFT JOIN 
    sheeps sh ON p.id = sh.guide_id
  JOIN 
    users u ON p.id = u.person_id
  WHERE 
    p.church_id = $1
  GROUP BY 
    p.id, p.first_name, p.last_name, p.email, p.phone;
`

  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay servidores por mostrar')
  }
  return result.rows
}

exports.getRolesServices = async () => {
  const query = 'SELECT * FROM roles_services;'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('Ups no hay servicios por mostrar')
  }
  return result.rows
}

exports.getAttendance = async (eventId) => {
  console.log('data', eventId)
  const query = 'SELECT * FROM attendees WHERE event_id = $1;'
  const result = await db.query(query, [eventId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay asistentes por mostrar')
  }
  return result.rows
}

exports.deleteAttendance = async (data) => {
  const query = 'DELETE FROM attendees WHERE person_id = $1 AND event_id = $2 RETURNING *;'
  const result = await db.query(query, [data.personId, data.eventId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al eliminar la asistencia')
  }
  return result.rows[0]
}

exports.getVisits = async (sheepId) => {
  const query = 'SELECT * FROM sheeps_visits WHERE sheep_id = $1;'
  const result = await db.query(query, [sheepId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay visitas por mostrar')
  }
  return result.rows
}

exports.assignServices = async (data) => {
  try {
    console.log('entramos a crear el servicio asignarlo con dato: ')
    console.log(data)
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

      if (serviceCount > 3) {
        throw new Error('El servidor ya tiene más de tres servicios asignados para esta fecha')
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

    return resultInsert.rows
  } catch (e) {
    console.log(e)
    return e
  }
}

exports.getServices = async (eventId) => {
  console.log('eventId in getServices: ', eventId)
  const query = `
    SELECT     
    p.*,
    sr.id as service_id,
    rl.id as rol_id,
    rl.name AS rol_servant
    FROM services sr
    JOIN roles_services rl ON sr.rol_servant_id = rl.id
    JOIN people p ON sr.servant_id = p.id
    JOIN events e ON sr.event_id = e.id
    WHERE e.id = $1;
  `
  const result = await db.query(query, [eventId])
  if (result.rows.length === 0) {
    return new Error('No hay servicios asignados')
  }
  console.log('result in getServices here: ', result.rows)
  return result.rows
}

exports.deleteAssignedService = async (serviceId) => {
  const query = 'DELETE FROM services WHERE id = $1 RETURNING *;'
  const result = await db.query(query, [serviceId])
  if (result.rows.length === 0) {
    return new Error('No se pudo eliminar el servicio asignado')
  }
  return result.rows[0]
}

exports.updateAssignedService = async (data) => {
  let query, result
  console.log('data in updateAssignedService: ', data)
  query = 'SELECT * FROM services WHERE event_id = $1;'
  result = await db.query(query, [data.eventId])
  console.log('result in updateAssignedService: ', result.rows)
  if (result.rows.length === 0) {
    return new Error('No hay servicios asignados para este evento')
  }

  // accion para comparar y borrar los que no vengan en el array data...

  // accion para actualizar las personas nuevas y las que ya estan en la base de datos
  query = `
    UPDATE services
    SET  rol_servant_id = $2
    WHERE id = $3 AND event_id = $4 AND servant_id = $1
    RETURNING *;
  `
  result = await db.query(query, [data.servantId, data.rolServantId, data.serviceId, data.eventId])
  console.log('aqui toiii')
  if (result.rows.length === 0) {
    return new Error('No se pudo actualizar el servicio asignado')
  }
  console.log('result in updateAssignedService: ', result.rows[0])
  return result.rows[0]
}
