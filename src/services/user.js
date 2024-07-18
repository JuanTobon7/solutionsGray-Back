const db = require('../databases/relationalDB')

exports.findById = async (id) => {  
    const query = `
        SELECT
        s.id,
        s.name,
        r.name as rol_name,
        s.church_id,
        c.name as church_name
        FROM servants s
        JOIN roles_administratives r ON r.id = s.rol_adm 
        LEFT JOIN churches c ON c.id = s.church_id
        WHERE s.id = $1;
    `;
    const user = await db.query(query,[id])    
    if(user.rows.length === 0){
        return new Error('ups hubo un error en la query')
    }
    user.metadata = user.metadata ? JSON.parse(user.metadata) : {}    
    return user.rows[0]
}