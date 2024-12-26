const neo4j = require('neo4j-driver')

// Variables globales para la sesión y el driver
let driver
let session

// Función para inicializar la conexión
const initializeConnection = async () => {
  const URI = process.env.DB_GRAFO_URI
  driver = neo4j.driver(URI, neo4j.auth.basic(process.env.GRAFO_USER, process.env.GRAFO_PASSWORD))
  session = driver.session()

  try {
    const result = await session.run('RETURN datetime() AS currentDateTime')
    result.records.forEach(record => {
      console.log(`Conexión a Neo4j exitosa: ${record.get('currentDateTime')}`)
    })
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
  }
}

// Función para obtener la sesión activa
const getSession = () => {
  if (!session) {
    console.log('La conexión a Neo4j no ha sido inicializada.')
    throw new Error('La conexión a Neo4j no ha sido inicializada.')
  }
  return session
}

// Exportamos la inicialización y la sesión
module.exports = { initializeConnection, getSession }
