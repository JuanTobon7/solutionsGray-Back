require('dotenv').config(); 

const express = require('express') 
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss-clean') //middlware para evitar inyección de scripts
const validate =require('../middlewares/validateData')

const app = express() //instancia de express

app.use(helmet()); //modifica cabeceras de seguridad evita XSS, clickjacking...
app.use(cors()) //habilita peticiones externas
app.use(xss()) //sanitiza las querys
app.use(express.json()) //parsea las querys
app.use(validate())

module.exports = app