const express = require('express')

module.exports = function (passport) {
  const controllerAuth = require('../controllers/auth')
  const defaultController = require('../controllers/default')
  const churchController = require('../controllers/ministries/churches') // controller for issues related to the local church, (temple)
  const defaultMinisteries = require('../controllers/ministries/default') // controller for shared functions between church groups (e.g. cell groups or houses of worship) and the church
  const sheepsController = require('../controllers/people/sheeps/index')
  const financeController = require('../controllers/finances/index')
  const courseController = require('../controllers/courses')
  const groupsController = require('../controllers/ministries/groups')
  const userController = require('../controllers/user')
  const defaultPeopleController = require('../controllers/people/default')
  const controllerAdministrativeApp = require('../controllers/administrativeApp')
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
  router.post('/save-people', passport.authenticate(['oauth2-client-password'], { session: false }), defaultPeopleController.savePeople) // ok
  router.post('/set-password', passport.authenticate(['oauth2-client-password'], { session: false }), controllerAuth.setPassword) // ok
  // verificará el token enviado al correo de la persona, sea usuario promedio o pastor, enviará una respuesta al front que les permitira crear el usuario.
  // invitate users
  router.post('/create-user', invitateGuest, controllerAuth.singUp) // ok
  router.post('/accept-invitation', invitateGuest, controllerAuth.acceptInvitation) // ok
  router.post('/verify-church-lead', invitateGuest, controllerAuth.verifyChurchLead) // ok
  router.post('/create-users', invitateGuest, controllerAuth.singUp) // ok
  router.get('/get-countries', defaultController.getCountries)
  router.get('/get-states/:countryId', defaultController.getStates) // ok

  // administrativeApp enpoints
  router.get('/get-leads', controllerAdministrativeApp.getLeads) // ok
  router.put('/update-lead/:leadId', controllerAdministrativeApp.updateLead) // ok
  // user endpoints
  router.use(state)
  router.post('/sing-out', controllerAuth.singOut) // ok
  router.get('/get-my-profile', userController.getMyProfile) // ok
  router.get('/get-parents-churches', churchController.getchurchParents) // ok
  // router.put('/update-profile', userController.updateProfile)
  router.put('/update-photo', userController.updatePhoto) // ok
  router.get('/get-stadistics-people-church/:minDate/:maxDate', churchController.getStadisticPeopleChurch)
  router.get('/get-stadistics-people-course/:minDate/:maxDate', courseController.getStadisticsPeopleCourse)
  router.get('/get-schedules-courses/:courseId', courseController.getShedulesCourses)
  router.get('/my-services/:date', defaultMinisteries.getMyServices) // ok
  router.get('/get-chapters-courses/:courseId', courseController.getChaptersCourses)
  router.get('/get-stadistic-assitance-church/:minDate/:maxDate', churchController.getStadisticAssistance)
  router.post('/create-groups', groupsController.createGroups)
  router.get('/get-my-info-group', groupsController.getMyInfoGroup)
  router.get('/get-group/:groupId', groupsController.getMyGroup)
  router.get('/get-groups', groupsController.getGroups)
  router.get('/get-my-courses', courseController.getMyCourses)
  router.get('/get-people-courses/:personId', courseController.getPeopleCourses)
  router.post('/register-attendance', defaultMinisteries.registerAttends) // ok
  router.get('/get-courses', courseController.getCourses)
  router.put('/finish-course/:courseId', courseController.finishCourse)
  router.get('/my-sheeps', sheepsController.getMySheeps) // esto se puede borrar para ahorrar codigo, ya hay getSheep by Servant
  router.post('/register-visits', sheepsController.resgisterVisits) // ok
  router.get('/services', defaultMinisteries.getRolesServices) // ok
  router.get('/get-visits/:sheepId', sheepsController.getVisits)
  router.get('/basic-info-user', userController.basicInfo) // ok
  router.get('/worship-services/:minDate/:maxDate', churchController.getWorshipServices) // ok
  router.post('/shedule-courses', courseController.sheduleCourses)
  router.get('/get-courses-in-charge', admin, courseController.getCoursesInCharge)
  router.get('/get-countries', defaultController.getCountries) // ok
  router.get('/sheep/:id', sheepsController.getSheep) // ok
  router.get('/sheeps-by-servant/:servantId', sheepsController.getSheepsByServant) // ok
  router.get('/get-currencies', financeController.getCurrency) // ok
  router.get('/get-types-contributions', financeController.getTypesContributions) // review
  router.get('/get-attendance/:eventId', defaultMinisteries.getAttendance) // ok
  router.get('/get-services-group/:groupId/:minDate/:maxDate', groupsController.getServicesGroup)
  router.get('/get-attendance-group/:groupId/:date', groupsController.getAttendanceGroup)
  router.delete('/delete-attendance/:personId/:eventId', defaultMinisteries.deleteAttendance)
  router.get('/check-qualified/:date', defaultMinisteries.checkQualified)
  router.post('/qualify-service', defaultMinisteries.qualifyService)

  // admin endpoints
  router.get('/get-rating-by-servant/:servantId', admin, defaultMinisteries.getRatingByServant)
  router.post('/register-sheeps', admin, sheepsController.registerSheeps) // ok
  router.get('/get-people', admin, defaultPeopleController.getPeople) // estoy puede ir en defaultController
  router.post('/register-visits', admin, sheepsController.resgisterVisits) // review ok
  router.get('/sheeps', admin, sheepsController.getSheeps)
  router.get('/get-types-people', admin, defaultPeopleController.getTypesPeople) //
  router.post('/save-contribution', admin, financeController.saveContribution)
  router.get('/get-students-course/:courseId', admin, courseController.getStudentsCourse)
  router.get('/get-attendance-course/:courseId', admin, courseController.getAttendanceCourse)
  router.post('/register-attendance-course', admin, courseController.registerAttendanceCourse)
  router.post('/register-nouser-course', admin, courseController.enrrollNoUsersInCourse)
  router.post('/add-person-strategy', admin, groupsController.addPersonStrategie)
  router.get('/get-strategy/:strategyId', admin, groupsController.getStrategyById)
  router.delete('/delete-attendance-course/:attenId', admin, courseController.deleteAttendanceCourse)
  router.get('/stadistic-attendance-course/:courseId', admin, courseController.stadisticAttendanceCourse)
  router.put('/evaluate-student/:studentId', admin, courseController.evaluateStudent)
  // super admin endpoints
  router.get('/types-worship-services', superAdmin, churchController.getTypesWorshipServices) // ok
  router.get('/assigned-services/:id', superAdmin, defaultMinisteries.getServices) // ok
  router.post('/create-worship-service', superAdmin, churchController.createWorshipServices) // ok
  router.post('/create-worship-service-group', admin, groupsController.createWorshipServices) // ok
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
  router.get('/servants', superAdmin, defaultMinisteries.getServants)
  router.get('/courses', superAdmin, courseController.getCourses)
  router.get('/average-rating-servants/:typeServiceId', superAdmin, defaultMinisteries.getServantsAverageRating)
  router.get('/average-rating-by-servant/:servantId', superAdmin, defaultMinisteries.getAverageRatingByServant)
  router.put('/update-rol-servant/:servantId', superAdmin, defaultMinisteries.updateRolesServants)
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
  if (!req.user || req.user.rolName === 'User' || req.user.rolName === 'Admin') {
    console.log('funcion Superadmin', req.user)
    return res.status(401).send('No tienes los permisos here')
  }
  await next()
}
