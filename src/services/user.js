const db = require('../databases/relationalDB')

exports.findById = async (id) => {
  try {
    const query = `
    SELECT
    s.id,
    s.name,
    r.name as rol_name,
    s.church_id as church_id,
    s.country_id as country_id,
    c.name as church_name
    FROM servants s
    JOIN roles_administratives r ON r.id = s.rol_adm 
    LEFT JOIN churches c ON c.id = s.church_id
    WHERE s.id = $1;
    `
    const user = await db.query(query, [id])
    if (user.rows.length === 0) {
      return new Error('ups hubo un error en la query')
    }
    console.log('yupiii', user.rows)
    const payload = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      rolName: user.rows[0].rol_name,
      churchId: user.rows[0].church_id,
      countryId: user.rows[0].country_id,
      churchName: user.rows[0].church_name
    }

    return payload
  } catch (e) {
    console.log(e)
    return e
  }
}
