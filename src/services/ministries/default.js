const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

function parseDate (data) {
  const parse = String.toString(data)
  return parse.split(' ')[0]
}

exports.registerAttends = async (data) => {
  console.log('data:', data)

  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM new_attendees WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)

  query = `
        INSERT INTO new_attendees (id,cc,name,email,country_id,church_id,event_id)
        VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *;
        `
  result = await db.query(query, [id, data.cc, data.name, data.email, data.countryId, data.churchId, data.eventId])
  if (result.rows.length === 0) {
    return new Error(`Ups algo fallo al registrar a la persona ${data.name}`)
  }
  return result.rows[0]
}

exports.registerSheep = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM sheeps WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)

  query = ` INSERT INTO sheeps (id,attendee_id,description,guide_id)
            VALUES ($1,$2,$3,$4) RETURNING *;
        `
  result = await db.query(query, [id, data.attendeeId, data.description, data.guideId])

  if (result.rows.length === 0) {
    return new Error('ups algo fallo al registrar a la persona en nuestra base de datos')
  }

  return result.rows[0]
}

exports.resgisterVisits = async (data) => {
  console.log(data)
  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM sheep_visits WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)

  query = 'SELECT visit_date as visit_date FROM  sheep_visits s WHERE sheep_id = $1 ORDER BY DATE(visit_date) DESC LIMIT 1;'
  result = await db.query(query, [data.sheepId])

  if (result.rows.length !== 0) {
    const lastVisitParsed = parseDate(result.rows[0].visit_date)
    const parsedVisitDate = parseDate(data.visitDateFormat)
    if (lastVisitParsed === parsedVisitDate) {
      return new Error(`Ya habias registrado una visita el día de hoy (${result.rows[0].visit_date}) si tienes algo por añadir puedes modificar la descripción de la visita`)
    }
  }

  query = ` INSERT INTO sheep_visits (id,visit_date,description,sheep_id)
            VALUES ($1,$2,$3,$4) RETURNING *;
        `
  result = await db.query(query, [id, data.visitDateFormat, data.description, data.sheepId])

  if (result.rows.length === 0) {
    return new Error('ups algo fallo al registrar la visita a la oveja en cuestion')
  }

  return result.rows[0]
}

exports.getSheeps = async (churchId) => {
  const query = `
    SELECT
      sh.id,
      sh.status,
      e.date AS arrival_date,
      sh.description,
      sh.guide_id AS guideID,
      att.name,
      att.email,
      (SELECT sv2.visit_date
       FROM sheep_visits sv2
       WHERE sv2.sheep_id = sh.id
       ORDER BY sv2.visit_date DESC
       LIMIT 1) AS last_visit,
      COUNT(sv.id) AS quantity_visits
    FROM new_attendees att
    JOIN sheeps sh ON att.id = sh.attendee_id
    JOIN sheep_visits sv ON sh.id = sv.sheep_id
    JOIN events e ON att.event_id = e.id
    WHERE att.church_id = $1
    GROUP BY sh.id, sh.status, e.date, sh.description, sh.guide_id, att.name, att.email
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }
  return result.rows
}

exports.getSheep = async (data) => {
  const query = `
    SELECT 
      sh.id,
      sh.status,
      e.date AS arrival_date,
      sh.description,
      sh.guide_id AS guideID,
      sv.visit_date AS last_visit,
      att.name,
      att.email,
      COUNT(sv.id) AS cuantity_visits
    FROM new_attendees att    
    JOIN sheeps sh ON att.id = sh.attendee_id
    JOIN sheep_visits sv ON sh.id = sv.sheep_id
    JOIN events e ON att.event_id = e.id
    WHERE att.church_id = $1 AND sh.id = $2
    GROUP BY sh.id,sh.status,e.date,sh.description,sh.guide_id,att.name,att.email,sv.visit_date
  `
  const result = await db.query(query, [data.churchId, data.id])

  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }

  return result.rows[0]
}

exports.getServants = async (churchId) => {
  const query = `
  SELECT
    s.name,
    s.email,
    s.phone_number,
    COUNT (DISTINCT sh.id) AS cuantity_sheeps_guide
  FROM servants s
  JOIN sheeps sh ON s.id = sh.guide_id
  WHERE s.church_id = $1
  GROUP BY s.name,s.email,s.phone_number
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay servidores por mostrar')
  }
  return result.rows
}
