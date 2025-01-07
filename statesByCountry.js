const { Pool } = require('pg')
const fetch = require('node-fetch')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid')

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

// Token for API authorization
const token = '' // Reemplaza con tu token de acceso

async function getCountries () {
  const result = await db.query('SELECT id, name FROM countries;')
  return result.rows
}

async function fetchStates (countryName) {
  const response = await fetch(`https://restfulcountries.com/api/v1/countries/${countryName}/states`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  })
  const data = await response.json()
  return data.data // Asumimos que la respuesta tiene una propiedad 'data' que contiene los estados
}

async function saveStatesToDB (states, countryId) {
  try {
    for (const state of states) {
      console.log(`Procesando estado: iso2=${state.iso2}, name=${state.name}, countryId=${countryId}`)
      if (!state.iso2 || !state.name || !countryId) {
        console.error(`Datos inválidos: iso2=${state.iso2}, name=${state.name}, countryId=${countryId}`)
        continue // Saltar este estado si los datos son inválidos
      }
      const uuid = uuidv4()
      const result = await db.query(
        'INSERT INTO states (id, name,short_name,country_id) VALUES ($1, $2,$3,$4) RETURNING *;',
        [uuid, state.name, state.iso2, countryId]
      )
      if (result.rows.length > 0) {
        console.log('Insert result:', result.rows)
      } else {
        console.log(`Estado ya existente: iso2=${state.iso2}, name=${state.name}, countryId=${countryId}`)
      }
    }
    console.log('Datos de estados guardados correctamente en la base de datos')
  } catch (error) {
    console.error('Error al guardar los datos en la base de datos:', error.stack)
  }
}

async function main () {
  try {
    const countries = await getCountries()
    for (const country of countries) {
      const states = await fetchStates(country.name)
      if (Array.isArray(states)) {
        await saveStatesToDB(states, country.id) // Usamos country.id como country_id
      } else if (typeof states === 'object') {
        await saveStatesToDB(states, country.id) // Usamos country.id como country_id
      }
    }
  } catch (e) {
    console.log({ error: e })
  }
}

main().catch(error => console.error('Error en el proceso principal:', error))
