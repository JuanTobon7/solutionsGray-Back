const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.createChurches = async (data) => {
  let churchId, result, query
  do {
    churchId = uuidv4()
    result = await db.query('SELECT * FROM churches WHERE id = $1', [churchId])
  } while (result.rows.length > 0)
  query = `

        INSERT INTO churches (id,name,parent_church_id,latitude,longitude,state_id) 
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING *;`
  console.log(churchId)
  result = await db.query(query, [churchId, data.name, data.parentChurchId, data.latitude, data.longitude, data.stateId])
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
  try {
    do {
      id = uuidv4()
      query = 'SELECT * FROM events WHERE id = $1;'
      result = await db.query(query, [id])
    } while (result.rows.length > 0)
    query = 'INSERT INTO events (id,worship_service_type_id,date,church_id,sermon_tittle,description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;'
    console.log('data in createWorshipServices: ', data)
    result = await db.query(query, [id, data.typeWorshipId, data.userDate, data.churchId, data.sermonTittle, data.description])
    if (result.rows.length === 0) {
      return new Error('Ups algo fallo al guardar el culto')
    }
    return result.rows[0]
  } catch (e) {
    console.log(e)
    return e
  }
}

exports.getWorshipServices = async (data) => {
  const query = `
    SELECT e.*,tws.name as worship_name FROM events e
    LEFT JOIN types_whorship_service tws 
    ON tws.id = e.worship_service_type_id
    WHERE church_id = $1 AND e.date BETWEEN $2 AND $3;`
  const result = await db.query(query, [data.churchId, data.minDate, data.maxDate])
  if (result.rows.length === 0) {
    return new Error('No hay cultos programados')
  }
  return result.rows
}

exports.updateWorshipService = async (data, date) => {
  console.log('In update service', data, ' and date', date)
  const query = `
  UPDATE events
  SET date = $1,
      sermon_tittle = $2,
      description = $3,
      worship_service_type_id = $4
  WHERE id = $5
  RETURNING *;
`

  const result = await db.query(query, [date, data.sermonTittle, data.description, data.typeWorshipId, data.id])

  console.log('result in updateWorshipService: ', result.rows[0])
  if (result.rows.length === 0) {
    return new Error('No hay cultos programados')
  }
  return result.rows[0]
}

exports.getStadisticPeopleChurch = async (data) => {
  const query = `
     SELECT 
        ch.name,
        ch.state_id AS stateId,
        COUNT(DISTINCT g.id) AS quantityGroups,
        SUM(CASE WHEN tp.name = 'Invitado' THEN 1 ELSE 0 END) AS countInvitado,
        SUM(CASE WHEN tp.name = 'Usuario' THEN 1 ELSE 0 END) AS countUsuario,
        SUM(CASE WHEN tp.name = 'Nuevo' THEN 1 ELSE 0 END) AS countNuevo,
        SUM(CASE WHEN tp.name = 'Oveja' THEN 1 ELSE 0 END) AS countOveja
    FROM churches ch
    JOIN (
        SELECT DISTINCT e.church_id
        FROM events e
        WHERE e.date BETWEEN $2 AND $3
    ) filtered_events ON filtered_events.church_id = ch.id
    JOIN people p ON ch.id = p.church_id
    JOIN types_people tp ON p.type_person_id = tp.id
    LEFT JOIN group_churches g ON ch.id = g.church_id
    WHERE ch.id = $1
    GROUP BY ch.name, ch.state_id;

  `
  const result = await db.query(query, [data.churchId, data.minDate, data.maxDate])
  if (result.rows.length === 0) {
    return new Error('No hay informacion que mostrar')
  }
  return result.rows[0]
}

exports.getStadisticAssistance = async (data) => {
  const query = `
    SELECT
        TO_CHAR(e.date, 'YYYY-MM') AS month,
        COUNT(a.id) AS attendance_count
    FROM
        events e
    JOIN
        attendees a ON e.id = a.event_id
    WHERE
        e.church_id = $1 AND
        e.date BETWEEN $2 AND $3
    GROUP BY
        TO_CHAR(e.date, 'YYYY-MM')
    ORDER BY
        month;

  `
  const result = await db.query(query, [data.churchId, data.minDate, data.maxDate])
  if (result.rows.length === 0) {
    return new Error('No hay informacion que mostrar')
  }
  console.log('result in getStadisticAssistance: ', result.rows)
  return result.rows
}

exports.getchurchParents = async () => {
  const query = `
    SELECT
      ch.name,
      ch.id,
      c.name AS country,
      s.name AS state,
      s.short_name AS state_shortName
    FROM churches ch
    JOIN states s ON ch.state_id = s.id
    JOIN countries c ON s.country_id = c.id
    WHERE ch.parent_church_id IS NULL;
  `
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('No hay iglesias')
  }
  return result.rows
}

exports.getEmails = async (churchId) => {
  const query = `
    SELECT p.email
    FROM people p
    WHERE p.church_id = $1;
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('No hay correos')
  }
  return result.rows
}
