const ouath2Services = require('../services/ouath2')
const moment = require('moment')
const jwt = require('jwt-simple')

exports.sigIn = async(req,res)=>{
    try{
        
        const {email,password} = req.body;
        if(!email || !password ){
            const error = new Error('Datos faltantes')
            res.status(400).send(error);
        }        

        const result = await ouath2Services.singIn(email,password);
        if(!result){
            res.status(401).send(result)
        }

        const duration = 60 * 60 * 1 // 1 hora
        const payload = {
            iat: moment().format('X'),
            exp: moment().add(duration,'seconds').format('X'),
            sub: result.id,
            rolName: result.rol_name,
            ouathId: process.env.SSR_CLIENT_ID
        }

        const token = jwt.encode(payload, process.env.JWT_SECRET,'HS256');
        const refreshToken = await ouath2Services.createRefreshToken({userId: payload.sub,created: payload.iat, expires:payload.exp});

    }catch(err){
        console.log('error: ',err)
    }
}