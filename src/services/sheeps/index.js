const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

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
