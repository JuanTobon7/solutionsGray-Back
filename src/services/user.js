const db = require('../databases/relationalDB')

exports.findById = async (id) => {
  try {
    const query = `
    SELECT
    pl.id,
    pl.first_name,
    pl.last_name,
    pl.email,
    r.name as rol_name,
    pl.church_id as church_id,
    pl.state_id as state_id,
    c.name as church_name
    FROM users usrs
    JOIN user_role r ON r.id = usrs.rol_user_id
    JOIN people pl ON pl.id = usrs.person_id
    LEFT JOIN churches c ON c.id = pl.church_id
    WHERE pl.id = $1;
    `
    // person.id,person.name,user_role,church.id,state.id,ch.name
    console.log('id', id)
    const user = await db.query(query, [id])
    if (user.rows.length === 0) {
      return new Error('No estas registrado en el sistema')
    }
    const payload = {
      id: user.rows[0].id,
      firstName: user.rows[0].first_name,
      lastName: user.rows[0].last_name,
      rolName: user.rows[0].rol_name,
      churchId: user.rows[0].church_id,
      stateId: user.rows[0].state_id,
      churchName: user.rows[0].church_name
    }

    return payload
  } catch (e) {
    console.log(e)
    return e
  }
}
