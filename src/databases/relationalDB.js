const { Pool } = require('pg')
let config
if (process.env.NODE_ENV !== 'production') {
  config = {
    user: process.env.DB_DEV_USER,
    host: 'localhost',
    database: process.env.DB_DEV_NAME,
    password: process.env.DB_DEV_PASSWORD,
    port: 5432
  }
} else {
  config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  }
}

const db = new Pool(config)

console.log('config', config)

db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err.stack)
  } else {
    console.log('Conexión a la base de datos exitosa', res.rows)
  }
})

module.exports = db
