const express = require('express');
const { session } = require('passport');

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
        return res.status(401).send('No tienes los permisos')
    }
    await next()

}

module.exports = function(passport){
    const controllerUser = require('../controllers/user')
    const controllerAuth = require('../controllers/auth')
    const serviceUser = require('../services/user')
    
    const router = express.Router();

    router.get('/JWT',superAdmin,(req,res)=>{console.log('Entro a la funcion prueba')})

    router.post('/login',controllerAuth.sigIn)
    router.post('/crearUsuario',controllerAuth.singUp)
   
    return router
}