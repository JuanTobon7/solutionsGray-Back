const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

function parseDate (data) {
  const parse = String.toString(data)
  return parse.split(' ')[0]
}

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

exports.registerSheep = async (data) => {
  let query, result
  query = `
            SELECT * FROM sheeps WHERE person_id = $1;
        `
  result = await db.query(query, [data.personId])
  if (result.rows.length > 0) {
    return new Error('Esta persona ya ha sido registrada como oveja')
  }
  query = 'UPDATE people SET type_person_id = (SELECT id FROM types_people WHERE name = \'Oveja\') WHERE id = $1;'
  result = await db.query(query, [data.personId])
  query = ` INSERT INTO sheeps (person_id,description,guide_id)
            VALUES ($1,$2,$3) RETURNING *;
        `
  result = await db.query(query, [data.personId, data.description, data.guideId])

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

  query = 'SELECT visit_date FROM  sheep_visits s WHERE sheep_id = $1 ORDER BY DATE(visit_date) DESC LIMIT 1;'
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
  console.log('churchId in getSheeps', churchId)
  /** *
   * Fecha de inicio
   * Status
   * id de la persona - oveja
   * nombre de la persona
   * email de la persona
   * ultima visita
   * cantidad de visitas
   * descripcion
   * guia a cargo
   * ***/
  const query = `
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      sh.status,
      sh.description,
      sh.guide_id,
      COUNT(sv.id) AS cuantity_visits,
      (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date DESC
       LIMIT 1) AS last_visit,
       (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date ASC
       LIMIT 1) AS arrival_date
    FROM people p
    JOIN sheeps sh ON p.id = sh.person_id
    LEFT JOIN sheeps_visits sv ON sh.person_id = sv.sheep_id
    WHERE p.church_id = $1
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, sh.status, sh.description, sh.guide_id, sv.visit_date,last_visit,arrival_date

  `
  console.log('query', query)
  const result = await db.query(query, [churchId])
  console.log('result', result)
  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }
  console.log('result', result.rows)
  return result.rows
}

exports.getTypesPeople = async () => {
  const query = `
    SELECT * FROM types_people
   WHERE  name != 'Lead pastor' AND name != 'Usuario';`
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('Ups no hay tipos de personas por mostrar')
  }
  return result.rows
}

exports.getSheep = async (data) => {
  /**
   * Fecha de primera visita
   * Status
   * id de la persona - oveja
   * nombre de la persona
   * email de la persona
   * ultima visita
   * cantidad de visitas
   * descripcion
   * * */
  const query = `
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      sh.status,
      sh.description,
      sh.guide_id,
      COUNT(sv.id) AS cuantity_visits,
      (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date DESC
       LIMIT 1) AS last_visit,
       (SELECT sv2.visit_date
      FROM sheeps_visits sv2
      WHERE sv2.sheep_id = sh.person_id
      ORDER BY sv2.visit_date ASC
      LIMIT 1) AS arrival_date
    FROM people p
    JOIN sheeps sh ON p.id = sh.person_id
    LEFT JOIN sheeps_visits sv ON sh.person_id = sv.sheep_id
    WHERE p.church_id = $1 AND sh.person_id = $2
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, sh.status, sh.description, sh.guide_id, sv.visit_date,last_visit,arrival_date
  `
  const result = await db.query(query, [data.churchId, data.id])

  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }

  return result.rows[0]
}

exports.getMySheeps = async (data) => {
  const query = `
     SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      sh.status,
      sh.description,
      sh.guide_id,
      COUNT(sv.id) AS cuantity_visits,
      (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date DESC
       LIMIT 1) AS last_visit,
       (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date ASC
       LIMIT 1) AS arrival_date
    FROM people p
    JOIN sheeps sh ON p.id = sh.person_id
    LEFT JOIN sheeps_visits sv ON sh.person_id = sv.sheep_id
    WHERE p.church_id = $1 AND sh.guide_id = $2
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, sh.status, sh.description, sh.guide_id, sv.visit_date,last_visit,arrival_date
  `
  const result = await db.query(query, [data.churchId, data.id])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }
  return result.rows
}

exports.getSheepsByServant = async (data) => {
  const query = `
     SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      sh.status,
      sh.description,
      sh.guide_id,
      COUNT(sv.id) AS cuantity_visits,
      (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date DESC
       LIMIT 1) AS last_visit,
       (SELECT sv2.visit_date
       FROM sheeps_visits sv2
       WHERE sv2.sheep_id = sh.person_id
       ORDER BY sv2.visit_date ASC
       LIMIT 1) AS arrival_date
    FROM people p
    JOIN sheeps sh ON p.id = sh.person_id
    LEFT JOIN sheeps_visits sv ON sh.person_id = sv.sheep_id
    WHERE p.church_id = $1 AND sh.guide_id = $2
    GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, sh.status, sh.description, sh.guide_id, sv.visit_date,last_visit,arrival_date
  `
  const result = await db.query(query, [data.churchId, data.servantId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ovejas por mostrar')
  }
  return result.rows
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

exports.getPeople = async (churchId) => {
  console.log('churchId in getPeople', churchId)
  const query = `
 SELECT
    p.id,
    p.cc,
    p.first_name,
    p.last_name,
    p.email,
    p.phone,
    tp.name AS type_person,
    tp.id AS type_person_id
  FROM people p
  JOIN types_people tp ON p.type_person_id = tp.id
  WHERE p.church_id = $1;

  `
  const result = await db.query(query, [churchId])
  console.log('result', result.rows)
  if (result.rows.length === 0) {
    return new Error('Ups no hay personas por mostrar')
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

exports.getTypesContributions = async () => {
  const query = 'SELECT * FROM types_contributions;'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('Ups no hay tipos de contribuciones por mostrar')
  }
  return result.rows
}

exports.saveContributions = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM contributions WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)
  query = `
    INSERT INTO contributions (id,person_id,event_id,currency_id)
    VALUES ($1,$2,$3,$4) RETURNING *;
  `
  result = await db.query(query, [id, data.personId, data.eventId, data.currencyId])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la contribución')
  }
  return result.rows[0]
}

exports.saveDetailsContributions = async (data) => {
  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM details_contributions WHERE id = $1;
        `
    result = await db.query(query, [id])
  }
  while (result.rows.length > 0)
  query = `
    INSERT INTO details_contributions 
    (id,contribution_id,type_contribution_id,amount)
    VALUES ($1,$2,$3,$4) RETURNING *;
  `
  result = await db.query(query, [id, data.contributionId, data.type, data.amount])
  if (result.rows.length === 0) {
    return new Error('Ups algo fallo al registrar la contribución')
  }
  return result.rows[0]
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

exports.getOfferings = async (eventId) => {
  const query = `
   SELECT 
    tc.name AS type_contribution, 
    SUM(dc.amount) AS amount,        
    COUNT(c.id) AS quantity_contributions
  FROM contributions c
  LEFT JOIN details_contributions dc ON c.id = dc.contribution_id AND c.event_id = $1
  RIGHT JOIN types_contributions tc ON dc.type_contribution_id = tc.id
  GROUP BY type_contribution;


  `
  const result = await db.query(query, [eventId])
  if (result.rows.length === 0) {
    return new Error('Ups no hay ofrendas por mostrar')
  }
  return result.rows
}
