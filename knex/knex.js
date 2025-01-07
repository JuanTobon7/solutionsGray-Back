const environment = process.env.NODE_ENV || 'development'
const config = require('../knexfile.js')[environment] // Asegúrate de que la ruta sea correcta
const knex = require('knex')(config)

module.exports = knex
