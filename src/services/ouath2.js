const db = require('../databases/relationalDB')
const { error } = require('neo4j-driver');
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid');

exports.singIn = async(email,password) => {
    try{
        const query = `
            SELECT s.id as id,s.name as name,s.church_id,s.password,r.name as rol_name FROM servants s
            JOIN roles_administratives r ON r.id = s.rol_adm WHERE s.email = $1;
        `
        const data = await db.query(query,email);
        const hashedPassword = data.password;
        
        if(!data){
            const error = new Error('Ups email incorrecto')
            return error
        }

        if(await !bcrypt.compare(password,hashedPassword)){
            const error = new Error('Ups contraseña incorrecta');
            return error
        }

        return data;
    }catch(e){
        console.log('error: ',e.message)
    }
}

exports.createRefreshToken = async (data) => {
    let token , result;
    do{
        token = uuidv4()
        result = await db.query('SELECT * FROM refresh_token WHERE id = $1',token)

    }while(result.length>0)

    const {userId,created,expires} = data
    const query = `INSERT INTO refresh_token VALUES($1,$2,$3,$4) RETURNING *;`
    result = db.query(query,[token,userId,created,expires]);
    
    return token;

}
