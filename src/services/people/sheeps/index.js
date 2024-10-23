const db = require('../../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

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

exports.registerVisits = async (data) => {
  console.log(data)
  let id, query, result
  do {
    id = uuidv4()
    query = `
            SELECT * FROM sheeps_visits WHERE id = $1;
        `
    result = await db.query(query, [id])
  } while (result.rows.length > 0)

  query = 'SELECT visit_date FROM  sheeps_visits s WHERE sheep_id = $1 ORDER BY DATE(visit_date) DESC LIMIT 1;'
  result = await db.query(query, [data.sheepId])

  if (result.rows.length !== 0) {
    const lastVisitParsed = result.rows[0].visit_date
    if (lastVisitParsed === data.date) {
      return new Error(`Ya habias registrado una visita el día de hoy (${result.rows[0].visit_date}) si tienes algo por añadir puedes modificar la descripción de la visita`)
    }
  }

  query = ` INSERT INTO sheeps_visits (id,visit_date,description,sheep_id)
            VALUES ($1,$2,$3,$4) RETURNING *;
        `
  result = await db.query(query, [id, data.date, data.description, data.sheepId])

  if (result.rows.length === 0) {
    return new Error('ups algo fallo al registrar la visita a la oveja en cuestion')
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
        COALESCE(COUNT(sv.id), 0) AS cuantity_visits,
        visit_dates.last_visit,
        visit_dates.arrival_date
    FROM people p
    JOIN sheeps sh ON p.id = sh.person_id
    LEFT JOIN (
        SELECT 
            sheep_id,
            MAX(visit_date) AS last_visit,
            MIN(visit_date) AS arrival_date
        FROM sheeps_visits
        GROUP BY sheep_id
    ) visit_dates ON sh.person_id = visit_dates.sheep_id
    LEFT JOIN sheeps_visits sv ON sh.person_id = sv.sheep_id
    WHERE p.church_id = $1
    GROUP BY 
        p.id, 
        p.first_name, 
        p.last_name, 
        p.email, 
        p.phone, 
        sh.status, 
        sh.description, 
        sh.guide_id, 
        visit_dates.last_visit,
        visit_dates.arrival_date;
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
  COALESCE(v.cuantity_visits, 0) AS cuantity_visits,
  v.last_visit,
  v.arrival_date
FROM people p
JOIN sheeps sh ON p.id = sh.person_id
LEFT JOIN (
    SELECT 
      sheep_id,
      COUNT(id) AS cuantity_visits,
      MAX(visit_date) AS last_visit,
      MIN(visit_date) AS arrival_date
    FROM sheeps_visits
    GROUP BY sheep_id
) v ON sh.person_id = v.sheep_id
WHERE p.church_id = $1 AND sh.guide_id = $2
GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone, sh.status, sh.description, sh.guide_id, v.cuantity_visits, v.last_visit, v.arrival_date;

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
