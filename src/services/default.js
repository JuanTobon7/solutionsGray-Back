const db = require('../databases/relationalDB')
const serviceEmail = require('../services/sendEmail/email')
const { v4: uuidv4 } = require('uuid');
const jwt = require('jwt-simple')

exports.sendLead = async(data) => {
    let id, query, result
    try{        
        do{
            id = uuidv4()
            query = `SELECT * FROM leads_pastor_churches WHERE id = $1;`
            result = await db.query(query,[id])
        }while(result.rows.length !== 0)
        query = `INSERT INTO leads_pastor_churches VALUES($1,$2,$3,$4,$5) RETURNING *;`
        result = await db.query(query,[id,data.churchName,data.email,data.pastorName,data.countryId])
        if(result.rows.length === 0){
            return new Error('Algo ha salido mal')
        }
        const payload = result.rows[0]
        const tokenEmail = jwt.encode(payload,process.env.INVITATE_SECRET,'HS256')
        const dataEmail = {...payload,token:tokenEmail}
        const emailSend = await serviceEmail.sendLead(dataEmail)
        if(!emailSend){
            throw new Error('No se pudo enviar email')
        }
        return 'Enviado Exitosamente'
    }catch(e){
        console.log({messageError:e})
        return e
    }
    
}