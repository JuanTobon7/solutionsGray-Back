const db = require('../databases/relationalDB')
const jwt = require('jwt-simple')

exports.sendLead = async (data) => {
  try {
    const query = 'INSERT INTO leads (person_id,church_name) VALUES($1,$2) RETURNING *;'
    const result = await db.query(query, [data.id, data.churchName])
    if (result.rows.length === 0) {
      return new Error('Algo ha salido mal al guardar la informacion del lead')
    }
    const payload = result.rows[0]
    const tokenEmail = jwt.encode(payload, process.env.INVITATE_SECRET, 'HS256')
    const dataEmail = { ...payload, token: tokenEmail }
    return dataEmail
  } catch (e) {
    console.log({ messageError: e })
    return e
  }
}

exports.getCountries = async () => {
  try {
    const query = 'SELECT * FROM countries'
    const result = await db.query(query)
    if (result.rows.length === 0) {
      return new Error('No hay paises en la base de datos')
    }
    return result.rows
  } catch (e) {
    return e.message
  }
}

exports.getStates = async (countryId) => {
  const query = 'SELECT * FROM states WHERE country_id = $1'
  const result = await db.query(query, [countryId])
  if (result.rows.length === 0) {
    return new Error('No hay estados en la base de datos')
  }
  return result.rows
}

exports.getAttends = async () => {
  const query = 'SELECT * FROM attendees WHERE id IS NOT NULL'
  const result = await db.query(query)
  if (result.rows.length === 0) {
    return new Error('No se han registrado asistencias')
  }
  return result.rows
}
