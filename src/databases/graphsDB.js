const neo4j = require('neo4j-driver')

const graphDb = async () => {
  const URI = process.env.DB_GRAFO_URI
  const driver = neo4j.driver(URI, neo4j.auth.basic(process.env.GRAFO_USER, process.env.GRAFO_PASSWORD))
  const session = driver.session()

  try {
    const result = await session.run('RETURN datetime() AS currentDateTime')
    result.records.forEach(record => {
      console.log(`Conexión a Neo4j exitosa: ${record.get('currentDateTime')}`)
    })
  } catch (err) {
    console.log(`Connection error\n${err}\nCause: ${err.cause}`)
  } finally {
    await session.close()
    await driver.close()
  }
}

module.exports = graphDb
