const { Pool } = require('pg')
const fetch = require('node-fetch')
const { v4: uuidv4 } = require('uuid')

require('dotenv').config()

const db = new Pool({
  user: process.env.DB_DEV_USER,
  host: 'localhost',
  database: process.env.DB_DEV_NAME,
  password: process.env.DB_DEV_PASSWORD,
  port: 5432
})

// Check database connection
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err.stack)
  } else {
    console.log('Conexión a la base de datos exitosa', res.rows)
  }
})

// Fetch data from API
fetch('https://restcountries.com/v3.1/region/Americas')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  })
  .then(data => {
    if (data && Array.isArray(data) && data.length > 0) { // Asegúrate de que 'data' es un array
      const filteredCountries = data.map(country => {
        const currencyCode = Object.keys(country.currencies) // Obtener el código de la moneda (XCD en este caso)
        console.log('currencyCode:', country.currencies[currencyCode])
        const currencySymbol = 's'// Obtener el símbolo de la moneda ($ en este caso)
        return {
          id: country.cca2, // Asumiendo que cca2 es el ID único para cada país
          name: country.name.common,
          currency: currencyCode[0],
          phone_code: country.idd.root + (country.idd.suffixes ? country.idd.suffixes[0] : ''),
          symbol: country.currencies[currencyCode]
        }
      })
      console.log('Filtered countries:', filteredCountries) // Log filtered data
      saveCountriesToDB(filteredCountries) // Guardar los datos filtrados en la base de datos
    } else {
      console.error('Data format is not supported or no data available:', data)
    }
  })
  .catch(error => console.error('Error fetching countries:', error))

// Function to save countries to database
async function saveCountriesToDB (countries) {
  try {
    for (const country of countries) {
      if (!country || !country.id || !country.name || !country.currency) {
        continue
      }
      console.log('Inserting country:', country.symbol)
      const symbol = country.symbol && country.symbol.symbol ? country.symbol.symbol : '$'

      let result = await db.query(
        'INSERT INTO countries (code, id, name) VALUES ($1, $2, $3) RETURNING *',
        [country.phone_code, country.id, country.name]
      )
      const id = uuidv4()
      result = await db.query(
        `INSERT INTO types_currencies (id,country_id,currency_type,currency_symbol) 
        VALUES
        ($1, $2, $3, $4) RETURNING *;
        `, [id, country.id, country.currency, symbol]
      )
      console.log('Insert result:', result.rows[0])
    }
    console.log('Datos de paises guardados correctamente en la base de datos')
  } catch (error) {
    console.error('Error al guardar los datos en la base de datos:', error.stack)
  }
}
