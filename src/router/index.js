const express = require('express')

module.exports = function (passport) {
  const controllerAuth = require('../controllers/auth')
  const defaultController = require('../controllers/default')
  const churchController = require('../controllers/ministries/churches') // controller for issues related to the local church, (temple)
  const defaultChurch = require('../controllers/ministries/default') // controller for shared functions between church groups (e.g. cell groups or houses of worship) and the church
  const userController = require('../controllers/user')
  const router = express.Router()

  router.get('/', (req, res) => {
    console.log('entro')
    res.status(200).send({ message: 'conectado' })
    console.log('conecto')
  })
  router.post('/save-leads-church', defaultController.sendLead) // ok
  // auth
  router.post('/login', passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.sigIn) // ok
  router.post('/refresh-token', passport.authenticate(['rtoken'], { session: false }), controllerAuth.refreshToken) // review
  // verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
  router.post('/accept-invitation', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.acceptInvitation) // ok
  router.post('/verify-church-lead', invitateGuest, passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.verifyChurchLead) // ok
  // invitate users
  router.post('/create-user', invitateGuest, controllerAuth.singUp) // ok
  // user endpoints
  router.use(state)
  router.get('/services', defaultChurch.getRolesServices) // ok
  router.get('/basic-info-user', userController.basicInfo) // ok
  router.get('/worship-services', churchController.getWorshipServices) // ok
  router.post('/register-new-attends', defaultController.registerAttends) // ok
  router.post('/enroll-servants-courses', churchController.enrollServantsCourses)

  // admin endpoints
  router.post('/register-sheeps', admin, defaultChurch.registerSheeps) // review okk but coninuos
  router.get('/get-people', admin, defaultChurch.getPeople) // ok
  router.post('/register-visits', admin, defaultChurch.resgisterVisits) // review ok
  router.post('/enroll-sheeps-courses', admin, churchController.enrollSheepsCourses)
  router.post('/save-people', admin, defaultController.savePeople) // ok
  router.get('/sheeps', admin, defaultChurch.getSheeps)
  router.get('/sheep/:id', admin, defaultChurch.getSheep)
  router.get('/my-sheeps', admin, defaultChurch.getMySheeps)
  router.get('/get-types-people', admin, defaultChurch.getTypesPeople)
  // super admin endpoints
  router.get('/types-worship-services', superAdmin, churchController.getTypesWorshipServices) // ok
  router.get('/assigned-services/:id', superAdmin, churchController.getServices) // ok
  router.post('/create-worship-service', superAdmin, churchController.createWorshipServices) // ok
  router.post('/create-rol-servant', superAdmin, churchController.createRolesServants)// ok
  router.post('/assing-services', superAdmin, churchController.asignServices) // ok por correo falta hacer uno por whattsapp pero más adelante
  router.get('/get-types-people')

  router.put('/update-worship-services', superAdmin, churchController.updateWorshipService)
  router.put('/update-assign-service', superAdmin, churchController.updateAssignedService)
  router.delete('/delete-assign-service/:serviceId', superAdmin, churchController.deleteAssignedService)
  router.post('/create-course', superAdmin, churchController.registerCourses)
  router.post('/assing-courses', superAdmin, churchController.assignCourses) // remember send an Email
  router.post('/invitation-boarding', superAdmin, controllerAuth.createInvitationBoarding) // ok
  router.get('/church', churchController.getChurchInfo)
  router.get('/servants', superAdmin, defaultChurch.getServants)
  router.get('/courses', superAdmin, churchController.getCourses)
  // pastor endpoints
  router.post('/create-church', pastor, churchController.createChurches) // ok

  return router
}

async function invitateGuest (req, res, next) {
  if (!req.newUser) {
    res.status(401).send('No tienes credenciales para estar aqui middleware')
    return
  }
  console.log('reqNewUser', req.newUser)
  await next()
}

async function pastor (req, res, next) {
  console.log('req pastor: ', req.user)
  if (!req.user || req.user.rolName !== 'Pastor') {
    res.status(401).send('No tienes credenciales para estar aqui')
    return
  }
  console.log('nos fuimos a la funcion')
  await next()
}

async function state (req, res, next) {
  console.log('in state')
  if (req.tokenError) {
    const statusToken = req.tokenError.message
    console.log('statusToken', statusToken)
    res.status(401).send({ message: statusToken })
    return
  }
  if (!req.user) {
    res.status(401).send({ message: 'Token Expired' })
    return
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
  console.log('req superadmin: ', req.user)
  if (!req.user || req.user.rol_name === 'User' || req.user.rol_name === 'Admin') {
    console.log('funcion Superadmin', req.user)
    return res.status(401).send('No tienes los permisos here')
  }
  await next()
}
