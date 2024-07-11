const express = require('express');

module.exports = function(passport){
    const controllerUser = require('../controllers/user')
    const controllerAuth = require('../controllers/auth')
    const serviceUser = require('../services/user')
    const invitationToken = require('../middlewares/invitationToken')

    const router = express.Router();
    
    router.get('/JWT',superAdmin,(req,res)=>{console.log('Entro a la funcion prueba'); res.status(200).send({message: 'paso jeje'})})

    router.post('/crearInvitacion',controllerAuth.createInvitationBoarding)
    router.post('/login',controllerAuth.sigIn)
    router.post('/crearUsuario',invitationToken,controllerAuth.singUp)
   
    return router
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