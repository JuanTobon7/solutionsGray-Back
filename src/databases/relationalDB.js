const {Pool} = require('pg')

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})


db.query('SELECT NOW()',(err, res) => {
    if (err) {
      console.error('Error al conectar a la base de datos', err.stack);
    } else {
      console.log('Conexión a la base de datos exitosa', res.rows);
    }
  });

module.exports = db;