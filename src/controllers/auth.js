const ouath2Services = require('../services/ouath2')
const moment = require('moment')
const jwt = require('jwt-simple')
const { error } = require('neo4j-driver')

exports.singUp = async(req,res) => {
    try{
        const {cc,name,email,password,countryId,rolAdm,churchId,phoneNumber} = req.body
        if(!cc || !name || !email || !password || !countryId || !rolAdm || !churchId || !phoneNumber ){
            const error = new Error('Faltan Datos')
            res.status(400).send({message: error})
        }
        const result = await ouath2Services.singUp({cc,name,email,password,countryId,rolAdm,churchId,phoneNumber})
        if(!result){
            res.status(500).send({message: result})
        }
        console.log('whyy')
        res.status(200).send({message: result})
    }catch(e){
        console.error('Error en sigUp: ', e);
        res.status(500).send({ message: 'Error interno del servidor', error: e.message });
    }
}

exports.sigIn = async(req,res)=>{
    try{
        
        const {email,password} = req.body;
        if(!email || !password ){
            const error = new Error('Datos faltantes')
            res.status(400).send({message: error})
        }        

        const result = await ouath2Services.singIn(email,password);
        console.log('return de singIm: ',result)
        if(!result){
            console.log('result invalido')
            res.status(401).send({message: error})
        }
        const duration = 60 * 60 * 1 // 1 hora
        const payload = {
            iat: moment().format('X'),
            exp: moment().add(duration,'seconds').format('X'),
            sub: result.id,
            rolName: result.rol_name,
            ouathId: process.env.SSR_CLIENT_ID
        }
        console.log('payload: ',payload)
        const token = jwt.encode(payload, process.env.JWT_SECRET,'HS256');
        const refreshToken = await ouath2Services.createRefreshToken({userId: payload.sub,created: payload.iat, expires:payload.exp});

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: duration * 1000,
          });
      
          res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: duration * 1000,
          });
      
          res.status(200).send({ message: 'Inicio de sesión exitoso',jwtDecodified:payload  });

    }catch(err){
        console.error('Error en sigIn: ', err);
        res.status(500).send({ message: 'Error interno del servidor', error: err.message });
    }
}
