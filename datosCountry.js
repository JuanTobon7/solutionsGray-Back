const { Pool } = require('pg')
const fetch = require('node-fetch')
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
    console.log('Received data:', JSON.stringify(data, null, 2)) // Log received data structure
    if (data && Array.isArray(data) && data.length > 0) { // Asegúrate de que 'data' es un array
      const filteredCountries = data.map(country => {
        const currencyCode = Object.keys(country.currencies) // Obtener el código de la moneda (XCD en este caso)
        console.log('currencyCode:', currencyCode[0])
        const currencyName = country.currencies[currencyCode]
        console.log('currencyName:', currencyName)
        return {
          id: country.cca2, // Asumiendo que cca2 es el ID único para cada país
          name: country.name.common,
          currency: currencyCode[0]
        }
      })
      saveCountriesToDB(filteredCountries) // Guardar los datos filtrados en la base de datos
    } else {
      console.error('Data format is not supported or no data available:', data)
    }
  })
  .catch(error => console.error('Error fetching countries:', error))

// Function to save countries to database
async function saveCountriesToDB (countries) {
  try {
    console.log('entro a saveCountries')
    console.log('countries:', countries)
    for (const country of countries) {
      if (!country || !country.id || !country.name || !country.currency) {
        continue
      }
      console.log('country', country.id, country.name, country.currency)
      const result = await db.query(
        'UPDATE countries SET currency = $1 WHERE id = $2 AND name = $3 RETURNING *',
        [country.currency, country.id, country.name]
      )
      console.log('Insert result:', result.rows[0])
    }
    console.log('Datos de paises guardados correctamente en la base de datos')
  } catch (error) {
    console.error('Error al guardar los datos en la base de datos:', error.stack)
  }
}
