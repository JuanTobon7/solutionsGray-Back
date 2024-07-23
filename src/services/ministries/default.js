const db = require('../../databases/relationalDB')
const { v4: uuidv4 } = require('uuid');

exports.registerAttends = async(data) => {
    console.log('data:',data)
    
    let id,query,result
    do{
        id = uuidv4()
        query = `
            SELECT * FROM new_attendees WHERE id = $1;
        `
        result = await db.query(query,[id])
    }while(result.rows.length > 0)
    
    query = `
        INSERT INTO new_attendees (id,cc,name,email,country_id,church_id,guide_id,event_id)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *;
        `
    result = await db.query(query,[id,data.cc,data.name,data.email,data.country_id,data.church_id,data.guide_id,data.eventId])
    if(result.rows.length === 0){
        return new Error(`Ups algo fallo al registrar a la persona ${data.name}`)
    }
    return result.rows[0]

}   

exports.registerSheep = async (data) => {
    let id,query,result
    do{
        id = uuidv4()
        query = `
            SELECT * FROM sheeps WHERE id = $1;
        `
        result = await db.query(query,[id])
    }while(result.rows.length > 0)
    
    query = ` INSERT INTO sheeps (id,attendee_id,description,guide_id)
            VALUES ($1,$2,$3,$4) RETURNING *;
        `
    result = await db.query(query,[id,data.attendeeId,data.description,data.guideId])

    if(result.rows.length === 0){
        return new Error('ups algo fallo al registrar a la persona en nuestra base de datos')        
    }

    return result.rows[0]
}

exports.resgisterVisits = async(data) => {
    let id,query,result
    do{
        id = uuidv4()
        query = `
            SELECT * FROM sheep_visits WHERE id = $1;
        `
        result = await db.query(query,[id])
    }while(result.rows.length > 0)
    
    query = ` INSERT INTO sheep_visits (id,visit_date,description,sheep_id)
            VALUES ($1,$2,$3,$4) RETURNING *;
        `
    result = await db.query(query,[id,data.visitDateFormat,data.description,data.sheepId])

    if(result.rows.length === 0){
        return new Error('ups algo fallo al registrar la visita a la oveja en cuestion')
    }

    return result.rows[0]
}