const ouath2Services = require('../services/ouath2')
const moment = require('moment')
const jwt = require('jwt-simple')
const { error } = require('neo4j-driver')
const sendEmail = require('../services/sendEmail/email')

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
        if(!result){
            console.log('result invalido')
            res.status(401).send({message: error})
        }
        const duration = 60 * 60 * 1 // 1 hora
        const payload = {
            sub: result.id,
            rol_name: result.rol_name,
            iat: moment().format('X'),
            exp: moment().add(duration,'seconds').format('X'),
            ouathId: process.env.SSR_CLIENT_ID
        }
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

exports.createInvitationBoarding = async (req,res) => {
    try{
        
        const {email} = req.body
        // Verificar si el email no está definido
        if (!email) {
          return res.status(400).send('No proporcionaste el email');
        }
        
        const duration = 60 * 60 * 2 //2 horas
        const created = moment().format('X')
        const expires = moment().add(duration,'seconds').format('X')
        const inviterId = req.user.id

        const result = await ouath2Services.createInvitationBoarding(email,inviterId,created,expires) 

        if(!result){
            res.status(401).send({message: result});
        }

        const churchName = req.user.church_name
        const invitation = await sendEmail.sendInvitationOnBoarding(email,churchName)
        if(!invitation){
            res.status(400).sendd('Ups algo salio mal, intenta nuevamente');
        }
        res.status(200).send({message: result})
    }catch(err){
        console.error('Error en createInvitation: ', err);
        res.status(500).send({ message: 'Error interno del servidor', error: err.message });
    }


}