require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean') // middlware para evitar inyección de scripts
const passport = require('../middlewares/passport')
const jwt = require('../middlewares/jwt')
const router = require('../router/index')(passport)
const app = express() // instancia de express
const invitationToken = require('../middlewares/invitationToken')
const cookieParser = require('cookie-parser')

const corsOptions = {
  origin: process.env.CLIENT_HOST,
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(helmet()) // modifica cabeceras de seguridad evita XSS, clickjacking...
app.use(cors(corsOptions)) // habilita peticiones externas
app.use(xss()) // sanitiza las querys
app.use(cookieParser())
app.use(express.json())
app.use(jwt)
app.use(invitationToken)
app.use(passport.initialize())
app.use(router)

module.exports = app
