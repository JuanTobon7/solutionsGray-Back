const express = require('express')

module.exports = function (passport) {
  const controllerAuth = require('../controllers/auth')
  const defaultController = require('../controllers/default')
  const churchController = require('../controllers/ministries/churches') // controller for issues related to the local church, (temple)
  const defaultChurch = require('../controllers/ministries/default') // controller for shared functions between church groups (e.g. cell groups or houses of worship) and the church
  const router = express.Router()

  // no auth
  // debe guardar el lead en la bd,enviarlo al email con el token
  router.post('/save-leads-church', defaultController.sendLead) // ok
  // auth
  router.post('/login', passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.sigIn) // ok
  // verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
  router.post('/accept-invitation', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.acceptInvitation) // ok
  router.post('/verify-church-lead', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.verifyChurchLead) // ok
  // Una vez se verifica el token de invitación para el pas o el usuario el front redirijira a la vista del Sing Up y podremos crear un usuario
  router.post('/create-user', invitateGuest, controllerAuth.singUp) // ok
  router.post('/create-church', pastor, churchController.createChurches) // ok
  router.post('/create-worship-service', superAdmin, churchController.createWorshipServices) // ok
  router.post('/create-rol-servant', superAdmin, churchController.createRolesServants)// ok
  router.post('/assing-services', superAdmin, churchController.assignServices) // ok por correo falta hacer uno por whattsapp pero más adelante
  router.post('/register-new-attends', state, defaultChurch.registerAttends) // ok
  router.post('/register-sheeps', admin, defaultChurch.registerSheeps) // review okk but coninuos
  router.post('/register-visits', admin, defaultChurch.resgisterVisits) // review ok
  router.post('/create-course', superAdmin, churchController.registerCourses)
  router.post('/assing-courses', superAdmin, churchController.assignCourses) // remember send an Email
  router.post('/enroll-servants-courses', state, churchController.enrollServantsCourses)
  router.post('/enroll-sheeps-courses', admin, churchController.enrollSheepsCourses)
  // security autorization

  router.post('/crearInvitacion', state, controllerAuth.createInvitationBoarding) // ok
  // se diferenciará el usario normal en cuanto que el token del pastor puesto que este tendra un atributo demás que el usuario invitado
  // tendra rol_adm mientras que el token del usuario no tendra dicho atributo

  return router
}

async function invitateGuest (req, res, next) {
  if (!req.newUser) {
    res.status(401).send('No tienes credenciales para estar aqui')
    return
  }
  console.log('reqNewUser', req.newUser)
  await next()
}

async function pastor (req, res, next) {
  console.log('req pastor: ', req.user)
  if (!req.user || req.user.rolNaME !== 'Pastor') {
    res.status(401).send('No tienes credenciales para estar aqui')
    return
  }
  await next()
}

async function state (req, res, next) {
  if (!req.user) {
    return res.status(401).send('No tienes credenciales por favor inicia sesion')
  }
  await next()
}

async function admin (req, res, next) {
  if (!req.user || req.user.rolName === 'User') {
    return res.status(401).send('No tienes los permisos')
  }
  await next()
}

async function superAdmin (req, res, next) {
  if (!req.user || req.user.rol_name === 'User' || req.user.rol_name === 'Admin') {
    console.log('funcion Superadmin', req.user)
    return res.status(401).send('No tienes los permisos here')
  }
  await next()
}
