const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid');

exports.registerAttends = async(data) => {
    console.log('data:',data)
    
    let id,query,result
    do{
        id = uuidv4()
        query = `
            SELECT * FROM attendees WHERE id = $1;
        `
        result = await db.query(query,[id])
    }while(result.rows.length > 0)
    
    query = `
        INSERT INTO attendees (id,cc,name,email,country_id,church_id,guide_id,event_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;
        `
    result = await db.query(query,[id,data.cc,data.name,data.email,data.country_id,data.church_id,data.guide_id,data.eventId])
    if(result.rows.length === 0){
        return new Error(`Ups algo fallo al registrar a la persona ${data.name}`)
    }
    return result.rows[0]

}   