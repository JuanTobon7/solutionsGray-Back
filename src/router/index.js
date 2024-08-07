const express = require('express')

module.exports = function (passport) {
  const controllerAuth = require('../controllers/auth')
  const defaultController = require('../controllers/default')
  const churchController = require('../controllers/ministries/churches') // controller for issues related to the local church, (temple)
  const defaultChurch = require('../controllers/ministries/default') // controller for shared functions between church groups (e.g. cell groups or houses of worship) and the church
  const router = express.Router()

  router.get('/', (req, res) => {
    console.log('entro')
    res.status(200).send({ message: 'conectado' })
    console.log('conecto')
  })
  router.post('/save-leads-church', defaultController.sendLead) // ok
  router.post('/enroll-servants-courses', state, churchController.enrollServantsCourses)
  // auth
  router.post('/login', passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.sigIn) // ok
  // verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
  router.post('/accept-invitation', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.acceptInvitation) // ok
  router.post('/verify-church-lead', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.verifyChurchLead) // ok
  // invitate users
  router.post('/create-user', invitateGuest, controllerAuth.singUp) // ok
  // user endpoints
  router.post('/register-new-attends', state, defaultChurch.registerAttends) // ok

  // admin endpoints
  router.post('/register-sheeps', admin, defaultChurch.registerSheeps) // review okk but coninuos
  router.post('/register-visits', admin, defaultChurch.resgisterVisits) // review ok
  router.post('/enroll-sheeps-courses', admin, churchController.enrollSheepsCourses)
  router.get('/sheeps', admin, defaultChurch.getSheeps)
  router.get('/sheep/:id', admin, defaultChurch.getSheep)
  router.get('/my-sheeps', admin, defaultChurch.getMySheeps)
  // super admin endpoints
  router.post('/create-worship-service', superAdmin, churchController.createWorshipServices) // ok
  router.post('/create-rol-servant', superAdmin, churchController.createRolesServants)// ok
  router.post('/assing-services', superAdmin, churchController.assignServices) // ok por correo falta hacer uno por whattsapp pero más adelante
  router.post('/create-course', superAdmin, churchController.registerCourses)
  router.post('/assing-courses', superAdmin, churchController.assignCourses) // remember send an Email
  router.post('/crearInvitacion', superAdmin, controllerAuth.createInvitationBoarding) // ok
  router.get('/church', state, churchController.getChurchInfo)
  router.get('/servants', superAdmin, defaultChurch.getServants)
  router.get('/courses', superAdmin, churchController.getCourses)
  // pastor endpoints
  router.post('/create-church', pastor, churchController.createChurches) // ok

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
