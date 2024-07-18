const { query } = require('express');
const db = require('../databases/relationalDB')
const { v4: uuidv4, v4 } = require('uuid');

exports.createChurch = async(data) => {
    let id, result
    do{        
        churchId = uuidv4()
        result = await db.query('SELECT * FROM churches WHERE id = $1',[id])
    }while(result.rows.length > 1)
    query = `
        INSERT INTO churches VALUES ($1,$2,$3,$4,(
        SELECT id FROM states WHERE id = $5 AND country_id = $6),
        $6) 
        RETURNING *;`
    result = await db.query(query,[churchId,data.name,data.parentChurchId,data.address,data.stateId,data.countryId])
    
    

    if(result.rows.length === 0)    {
        return new Error('Ups algo paso al registrar tu iglesia')        
    }    


    query = `INSERT INTO church_pastor (pastor_id,church_id) VALUES ($1,$2) RETURNING *;`
    result = await db.query(query,[data.pastorId,churchId])

    const updateQuery = `
        UPDATE servants 
        SET church_id = $1 
        WHERE id = $2
        RETURNING *;
    `;
    const updateResult = await db.query(updateQuery, [churchId, data.pastorId]);

    if (updateResult.rows.length === 0) {
        return new Error('Ups algo paso al actualizar el church_id en la tabla servants');
    }

    return result.rows[0]
}