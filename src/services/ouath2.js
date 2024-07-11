const db = require('../databases/relationalDB')
const { error } = require('neo4j-driver');
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

exports.getInfoFromValidToken = async(rtoken)=>{
    if(!rtoken){
        return new Error('token invalido')
    }
    const query = `
        SELECT rt.*,s.name FROM refresh_token rt
        JOIN servants s ON s.id = rt.user_id
        WHERE rt.id = $1;
    `    
    const result = await db.query(query,[rtoken])
    return result
}

exports.singUp = async (data)=> {    
    
    let id,result
    do{
        id = uuidv4()
        result = await db.query('SELECT * FROM servants WHERE id = $1',[id])
    }while(result.length>0)

        const query = `
        INSERT INTO servants (id, cc, name, email, password, country_id, rol_adm, church_id, phone_number)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      
      result = await db.query(query, [
        id,
        data.cc,
        data.name,
        data.email,
        data.password,
        data.countryId,
        data.rolAdm,
        data.churchId,
        data.phoneNumber
      ]);
    if(result.rows.length === 0){
        const error = new Error('Error en la Query')
    }

    return 'Usuario Creado Exitosamente'
}

exports.singIn = async(email,password) => {
    try{
        const query = `
            SELECT s.id as id,s.name as name, s.password  FROM servants s
            JOIN roles_administratives r ON r.id = s.rol_adm WHERE s.email = $1;
        `
        const result = await db.query(query,[email]);        

        if(result.rows.length === 0){
            const error = new Error('Ups email incorrecto')
            return error
        }
        const data = result.rows[0]

        const hashedPassword = data.password;
                
        if(await !bcrypt.compare(password,hashedPassword)){
            const error = new Error('Ups contraseña incorrecta');
            return error
        }

        return data;
    }catch(e){
        if(process.env.NODE_ENV === 'develop'){            
            console.log('error: ',e.message)
        }        
    }
}

exports.createRefreshToken = async (data) => {
    let token , result;
    do{
        token = uuidv4()
        result = await db.query('SELECT * FROM refresh_token WHERE id = $1',[token])

    }while(result.length>0)

    const {userId,created,expires} = data
    const query = `INSERT INTO refresh_token VALUES($1,$2,$3,$4) RETURNING *;`
    result = db.query(query,[token,userId,created,expires]);
    
    return token;

}

exports.invitation_boarding = async(data)=>{
    try{
        const {email,status} = data
        if(!email){
            const error = new Error('Credenciales faltantes')
            throw error
        }
        const query = `UPDATE invitations SET status = $1 WHERE email = $2 RETURNING *;`
        const result = await db.query(query,[email])

        if(result.rows.length === 0){
            const error = new Error('No tienes credenciales')
            throw error
        }

        return result.rows[0]

    }catch(e){
        return ('Ups algo fallo',e.message)
    }
}

exports.createInvitationBoarding = async(email,inviterId,created,expires) => {
    try{
        const id = uuidv4()
        const query = `
        INSERT INTO invitations (id, inviter_id, email, created_at, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const result = await db.query(query, [id, inviterId, email, created, expires]);

        if(result.rows.length === 0){
            return new Error('Error al Insertar Dato')
        }

        const data = result.rows[0]
        return data

    }catch(e){
        if(process.env.NODE_ENV === 'develop'){            
            console.log('error: ',e.message)
        }
    }
}

