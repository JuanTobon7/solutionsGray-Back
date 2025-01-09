const db = require('../databases/relationalDB')

exports.getLeads = async () => {
  const query = `
        SELECT 
            p.*, 
            c.name as country_name,
            s.name as state_name,
            l.church_name,
            l.status as lead_status
        FROM people p
        JOIN states s ON p.state_id = s.id
        JOIN countries c ON s.country_id = c.id
        JOIN leads l ON p.id = l.person_id
        WHERE p.type_person_id = '3'
    `
  const result = await db.query(query)
  if (result.rows.length === 0) return new Error('No se encontraron leads')
  return result.rows
}

exports.updateLead = async (data) => {
  const query = 'UPDATE leads SET status = $1 WHERE person_id = $2 RETURNING *'
  const result = await db.query(query, [data.status, data.leadId])
  if (result.rows.length === 0) return new Error('No se encontró el lead')
  return result.rows[0]
}
