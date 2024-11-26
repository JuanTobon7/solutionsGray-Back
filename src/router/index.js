const express = require('express')

module.exports = function (passport) {
  const controllerAuth = require('../controllers/auth')
  const defaultController = require('../controllers/default')
  const churchController = require('../controllers/ministries/churches') // controller for issues related to the local church, (temple)
  const defaultMinisteries = require('../controllers/ministries/default') // controller for shared functions between church groups (e.g. cell groups or houses of worship) and the church
  const sheepsController = require('../controllers/people/sheeps/index')
  const financeController = require('../controllers/finances/index')
  const courseController = require('../controllers/courses')
  const userController = require('../controllers/user')
  const defaultPeopleController = require('../controllers/people/default')
  const router = express.Router()

  router.get('/', (req, res) => {
    console.log('entro')
    res.status(200).send({ message: 'conectado' })
    console.log('conecto')
  })
  router.post('/save-leads-church', defaultController.sendLead) // ok
  // auth
  router.get('/get-offerings/:eventId', financeController.getOfferings)

  router.post('/login', passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.sigIn) // ok
  router.post('/refresh-token', passport.authenticate(['rtoken'], { session: false }), controllerAuth.refreshToken) // review
  // verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
  // invitate users
  router.post('/create-user', invitateGuest, controllerAuth.singUp) // ok
  router.post('/accept-invitation', invitateGuest, controllerAuth.acceptInvitation) // ok
  router.post('/verify-church-lead', invitateGuest, controllerAuth.verifyChurchLead) // ok
  router.post('/create-users', invitateGuest, controllerAuth.singUp) // ok
  // user endpoints
  router.get('/get-countries', defaultController.getCountries)
  router.use(state)
  router.get('/get-schedules-courses/:courseId', courseController.getShedulesCourses)
  router.get('/get-chapters-courses/:courseId', courseController.getChaptersCourses)
  router.get('/get-my-courses', courseController.getMyCourses)
  router.post('/register-attendance', defaultMinisteries.registerAttends) // ok
  router.get('/get-courses', courseController.getCourses)
  router.get('/my-sheeps', sheepsController.getMySheeps) // esto se puede borrar para ahorrar codigo, ya hay getSheep by Servant
  router.post('/register-visits', sheepsController.resgisterVisits) // ok
  router.get('/services', defaultMinisteries.getRolesServices) // ok
  router.get('/get-visits/:sheepId', sheepsController.getVisits)
  router.get('/basic-info-user', userController.basicInfo) // ok
  router.get('/worship-services', churchController.getWorshipServices) // ok
  router.post('/save-people', defaultPeopleController.savePeople) // ok
  router.post('/shedule-courses', courseController.sheduleCourses)
  router.get('/get-courses-in-charge', admin, courseController.getCoursesInCharge)
  router.get('/get-countries', defaultController.getCountries) // ok
  router.get('/get-states/:countryId', defaultController.getStates) // ok
  router.get('/sheep/:id', sheepsController.getSheep) // ok
  router.get('/sheeps-by-servant/:servantId', sheepsController.getSheepsByServant) // ok
  router.get('/get-currencies', financeController.getCurrency) // ok
  router.get('/get-types-contributions', financeController.getTypesContributions) // review
  router.get('/get-attendance/:eventId', defaultMinisteries.getAttendance) // ok
  router.delete('/delete-attendance/:personId/:eventId', defaultMinisteries.deleteAttendance)

  // admin endpoints
  router.post('/register-sheeps', admin, sheepsController.registerSheeps) // ok
  router.get('/get-people', admin, defaultPeopleController.getPeople) // estoy puede ir en defaultController
  router.post('/register-visits', admin, sheepsController.resgisterVisits) // review ok
  router.get('/sheeps', admin, sheepsController.getSheeps)
  router.get('/get-types-people', admin, defaultPeopleController.getTypesPeople) //
  router.post('/save-contribution', admin, financeController.saveContribution)
  router.get('/get-students-course/:courseId', admin, courseController.getStudentsCourse)
  // super admin endpoints
  router.get('/types-worship-services', superAdmin, churchController.getTypesWorshipServices) // ok
  router.get('/assigned-services/:id', superAdmin, defaultMinisteries.getServices) // ok
  router.post('/create-worship-service', superAdmin, churchController.createWorshipServices) // ok
  router.post('/create-rol-servant', superAdmin, defaultMinisteries.createRolesServants)// esto puede ir en defaultMinisteries
  router.post('/assing-services', superAdmin, defaultMinisteries.asignServices) // falta por correo y hacer uno por whattsapp pero más adelante

  router.put('/update-worship-services', superAdmin, churchController.updateWorshipService)
  router.put('/update-assign-service', superAdmin, defaultMinisteries.updateAssignedService) // esto puede ir en defaultMinisteries
  router.delete('/delete-assign-service/:serviceId', superAdmin, defaultMinisteries.deleteAssignedService) // esto puede ir en defaultMinisteries
  router.post('/create-course', superAdmin, courseController.registerCourses) // revisar
  router.post('/create-chapters-course', superAdmin, courseController.registerChaptersCourses) // revisar
  router.post('/assing-courses', superAdmin, courseController.assignCourses) // remember send an Email
  router.post('/save-shedules-courses', superAdmin, courseController.saveShedulesCourses) // ok
  router.post('/invitation-boarding', superAdmin, controllerAuth.createInvitationBoarding) // ok
  router.get('/church', churchController.getChurchInfo)
  router.get('/servants', superAdmin, defaultMinisteries.getServants)
  router.get('/courses', superAdmin, courseController.getCourses)
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
