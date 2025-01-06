const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

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
