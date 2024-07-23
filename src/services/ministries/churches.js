const { query } = require('express');
const db = require('../../databases/relationalDB')
const { v4: uuidv4, v4 } = require('uuid');
const { Result } = require('neo4j-driver');

exports.createChurch = async(data) => {
    let id, result
    do{        
        churchId = uuidv4()
        result = await db.query('SELECT * FROM churches WHERE id = $1',[id])
    }while(result.rows.length > 0)
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

exports.createWorshipService = async(data) => {
    let query,result,id
    do{
        id = uuidv4()
        query = `SELECT * FROM events WHERE id = $1;`
        result = await db.query(query,[id])
        
    }while(result.rows.length > 0)
    query = `INSERT INTO events (id,name,date,church_id) VALUES ($1,$2,$3,$4) RETURNING *;`
    result = await db.query(query,[id,data.name,data.dateWhorship,data.churchId])
    if(result.rows.length === 0){
        return new Error('Ups algo fallo al guardar el culto')
    }

    return result.rows[0]
}

exports.createRolesServants = async(name) => {
    let query,result,id
    do{
        id = uuidv4()
        query = `SELECT * FROM roles_servants WHERE id = $1;`
        result = await db.query(query,[id])
        
    }while(result.rows.length > 0)
    query = `INSERT INTO roles_servants (id,name) VALUES ($1,$2) RETURNING *;`
    result = await db.query(query,[id,name])
    
    if(result.rowCount.length === 0){
        return new Error('Ups algo fallo al guardar el rol para servidor')
    }

    return result.rows[0]
}

exports.assignServices = async (data) => {
    try {
        // Consulta para verificar la cuenta de servicios y roles
        const queryCheckServiceCount = `
            SELECT 
                COUNT(sr.servant_id) AS service_count
            FROM services sr
            JOIN events e ON sr.event_id = e.id
            WHERE sr.servant_id = $1 AND e.id = $2
            GROUP BY sr.servant_id;
        `;
        const resultCheckServiceCount = await db.query(queryCheckServiceCount, [data.servantId, data.eventId]);

        if (resultCheckServiceCount.rows.length !== 0) {
            const serviceCount = parseInt(resultCheckServiceCount.rows[0].service_count, 10);

            if (serviceCount >= 2) {
                throw new Error('El servidor ya tiene más de dos servicios asignados para esta fecha');
            }
        }

        // Verificar si el rol del servidor ya está asignado para este evento
        const queryCheckRole = `
            SELECT 
                sr.id
            FROM services sr
            WHERE sr.servant_id = $1 AND sr.event_id = $2 AND sr.rol_servant_id = $3
        `;
        const resultCheckRole = await db.query(queryCheckRole, [data.servantId, data.eventId, data.rolServantId]);

        if (resultCheckRole.rows.length > 0) {
            throw new Error('El servidor ya tiene asignado ese rol en esta fecha');
        }
        // Asignación de un nuevo servicio
        const id = uuidv4();

        const queryInsert = `
            INSERT INTO services (id, servant_id, rol_servant_id, event_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const resultInsert = await db.query(queryInsert, [id, data.servantId, data.rolServantId, data.eventId]);

        if (resultInsert.rows.length === 0) {
            throw new Error('Ups algo fallo al asignar el servicio');
        }

        // Consulta para obtener detalles del servicio asignado
        const queryDetails = `
            SELECT 
                s.name AS servant_name,
                s.email AS servant_email,
                r.name AS rol_servant_name,
                c.name AS church_name,
                e.date,
                e.name AS event_name
            FROM 
                servants s
            JOIN 
                services sr ON s.id = sr.servant_id
            JOIN
                roles_servants r ON r.id = sr.rol_servant_id
            JOIN 
                churches c ON c.id = s.church_id
            JOIN 
                events e ON e.id = sr.event_id
            WHERE 
                sr.id = $1;
        `;
        const resultDetails = await db.query(queryDetails, [id]);

        if (resultDetails.rows.length === 0) {
            throw new Error('Ups algo fallo al asignar el servicio');
        }

        return resultDetails.rows[0];
    } catch (e) {
        console.log(e);
        return e;
    }
};