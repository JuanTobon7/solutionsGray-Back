const db = require('../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jwt-simple')

exports.savePeople = async (data) => {
  try {
    console.log('data save People', data)
    let id, result, query
    do {
      id = uuidv4()
      query = 'SELECT * FROM people WHERE id = $1'
      result = await db.query(query, [id])
    } while (result.rows.length > 0)

    // es una nueva persona asi que ingresamos en entidad personas para posteriormente asociarle un leads
    query = `
      INSERT INTO people (id, cc, first_name, last_name, email, phone, type_person_id, state_id, church_id)
      VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (cc, church_id)
      DO NOTHING
      RETURNING *          
    `

    // Número de parámetros enviados: 9
    result = await db.query(query, [
      id,
      data.cc,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.typePerson,
      data.stateId,
      data.churchId
    ])

    console.log('result', result.rows)
    if (result.rows.length === 0) {
      return new Error('Puede que esta persona ya exista en tu iglesia')
    }

    return result.rows[0]
  } catch (e) {
    console.log({ messageError: e })
    return e
  }
}

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
