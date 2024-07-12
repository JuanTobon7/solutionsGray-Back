require('dotenv').config(); 

const express = require('express') 
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean') //middlware para evitar inyección de scripts
const passport = require('../middlewares/passport');
const jwt = require('../middlewares/jwt')
const router = require('../router/index')(passport);
const app = express() //instancia de express
const invitationToken = require('../middlewares/invitationToken')

app.use(helmet()); //modifica cabeceras de seguridad evita XSS, clickjacking...
app.use(cors()) //habilita peticiones externas
app.use(xss()) //sanitiza las querys
app.use(express.json());
app.use(jwt)
app.use(invitationToken)
app.use(passport.initialize());
app.use('/api',router);

module.exports = app