const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid')

exports.createGroups = async (data) => {
  let query, id, result
  do {
    id = uuidv4()
    query = 'SELECT id FROM group_churches WHERE id = $1'
    result = await db.query(query, [id])
  } while (result.rows.length > 0)
  query = `
      INSERT INTO group_churches (id,name,latitude,longitude,church_id,leader_id)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `
  result = await db.query(query, [id, data.name, data.latitude, data.longitude, data.churchId, data.leaderId])
  if (result.rows.length === 0) {
    return new Error('Error al crear el grupo')
  }
  return result.rows[0]
}

exports.getGroups = async (churchId) => {
  const query = `
    SELECT g.*,p.first_name,p.last_name,p.phone,p.email,p.avatar FROM group_churches g
    JOIN people p ON g.leader_id = p.id 
    WHERE g.church_id = $1
  `
  const result = await db.query(query, [churchId])
  if (result.rows.length === 0) {
    return new Error('No hay grupos')
  }
  return result.rows
}
