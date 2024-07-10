const db = require('../databases/relationalDB')

exports.findById = async (id) => {
     const query = `
     SELECT s.id, s.name,c.name as country_name,r.name as rol_name,s.church_id
        FROM servants s 
        JOIN roles_administratives r ON r.id = s.rol_adm
        JOIN country c ON c.id = s.country_id
        WHERE s.id = $1
     `
    const user = await db.query(query,[id])
    if(user.rows.length === 0){
        return new Error('ups hubo un error en la query')
    }
    user.metadata = user.metadata ? JSON.parse(user.metadata) : {}
    console.log('user metadata: ',user.metadata)
    return user
}

