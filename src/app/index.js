require('dotenv').config(); 

const express = require('express') 
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean') //middlware para evitar inyección de scripts
const passport = require('../middlewares/passport');
const router = require('../router/index')(passport);
const bodyParser = require('body-parser')
const app = express() //instancia de express

app.use(helmet()); //modifica cabeceras de seguridad evita XSS, clickjacking...
app.use(cors()) //habilita peticiones externas
app.use(xss()) //sanitiza las querys
app.use(bodyParser.json())
app.use(express.json()) //parsea las querys
app.use(passport.initialize());
app.use('/api',router);

module.exports = app