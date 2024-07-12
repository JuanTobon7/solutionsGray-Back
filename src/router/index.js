const express = require('express');
const { session } = require('passport');

module.exports = function(passport){
    const controllerUser = require('../controllers/user')
    const controllerAuth = require('../controllers/auth')
    const serviceUser = require('../services/user')
    const invitationToken = require('../middlewares/invitationToken')
    const defaultController = require('../controllers/default')
    const router = express.Router();
    //no auth
    router.get('/JWT',superAdmin,(req,res)=>{console.log(req.user);console.log('Entro a la funcion prueba'); res.status(200).send({message: 'paso jeje'}); return})
    //auth
    router.post('/login',passport.authenticate(['oauth2-client-password'],{session:false}),controllerAuth.sigIn)
    router.post('/crearUsuario',invitateGuest,controllerAuth.singUp) 
    //enviara una respuesta determinante si si ha sido invitado el front procedera a pasarlo a la pagina para crear usuario
    //devolvera un token al usuario el cual será firmado teniendo por ddefault rold_adm: user
    router.post('/verify-invitation',passport.authenticate(['oauth2-client-password'],{session:false}),controllerAuth.verifyInvitation,(req,res)=>{
        console.log('req: ',req)
        console.log({cookies: req.cookies})
        console.log({ownerCookie: req.user})
        return
    })

    //security autorization
    //router.post('/createChurch') debe estar validado como pastor.
    router.post('/crearInvitacion',admin,controllerAuth.createInvitationBoarding)
    //se diferenciará el usario normal en cuanto que el token del pastor puesto que este tendra un atributo demás que el usuario invitado
    //tendra rol_adm mientras que el token del usuario no tendra dicho atributo
   
    return router
}


async function invitateGuest(req,res,next){
    if(!req.guest){
        return res.status(401).send(`No estas habilitado para crearte un usuario, contactate con tu lider o pastor 
            sí eres pastor y quieres afiliar la iglesia que pastoreas por favor contactane con nosotros`)
    }
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
    if(!req.user || req.user.rol_name !== 'Super_Admin'){
        console.log('funcion admin',req.user)
        return res.status(401).send('No tienes los permisos')
    }    
    await next()

}