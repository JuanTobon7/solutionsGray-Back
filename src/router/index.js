const express = require('express');
const { session } = require('passport');

module.exports = function(passport){
    const controllerUser = require('../controllers/user')
    const controllerAuth = require('../controllers/auth')
    const serviceUser = require('../services/user')
    const invitationToken = require('../middlewares/invitationToken')
    const defaultController = require('../controllers/default')
    const churchController = require('../controllers/churches')

    const router = express.Router();
    
    //no auth
    //debe guardar el lead en la bd,enviarlo al email con el token
    router.post('/save-leads-church',defaultController.sendLead) //ok
    //auth
    router.post('/login',passport.authenticate(['oauth2-client-password'],{session:false}),controllerAuth.sigIn) //ok
    //verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
    router.post('/accept-invitation',invitateGuest,passport.authenticate(['oauth2-client-password'],{session:false}),controllerAuth.acceptInvitation) 
    router.post('/verify-church-lead',invitateGuest,passport.authenticate(['oauth2-client-password'],{session: false}),controllerAuth.verifyChurchLead)
    //Una vez se verifica el token de invitación para el pas o el usuario el front redirijira a la vista del Sing Up y podremos crear un usuario
    router.post('/create-user',invitateGuest,controllerAuth.singUp) //ok
    router.post('/create-church',pastor,churchController.createChurch)

    
    //security autorization
    
    router.get('/JWT',superAdmin,(req,res)=>{console.log(req.user);console.log('Entro a la funcion prueba'); res.status(200).send({message: 'paso jeje'}); return})
    router.post('/crearInvitacion',admin,controllerAuth.createInvitationBoarding) //ok
    //se diferenciará el usario normal en cuanto que el token del pastor puesto que este tendra un atributo demás que el usuario invitado
    //tendra rol_adm mientras que el token del usuario no tendra dicho atributo
   
    return router
}


async function invitateGuest(req,res,next){
    if(!req.newUser){
        res.status(401).send('No tienes credenciales para estar aqui')
        return 
    }
    console.log('reqNewUser',req.newUser)
    await next()
}

async function pastor(req,res,next){
    console.log('req: ',req.user)
    if(!req.user || req.user.rol_name !== 'Pastor'){
        res.status(401).send('No tienes credenciales para estar aqui')
        return 
    }
    await next()
}

async function state (req,res,next){
    if(!req.user){
        return res.status(401).send('No tienes credenciales por favor inicia sesion')
    }
    await next()
}

async function admin(req,res,next){
    if(!req.user || req.user.rol_name === 'User'){
        return res.status(401).send('No tienes los permisos')
    }
    await next()
}


async function superAdmin(req,res,next){
    if(!req.user || req.user.rol_name !== 'Super_Admin' || req.user.rol_name === 'Pastor'){
        console.log('funcion admin',req.user)
        return res.status(401).send('No tienes los permisos')
    }    
    await next()

}