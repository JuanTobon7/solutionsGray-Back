const redis = require('redis')

// Crear cliente Redis
const redisClient = redis.createClient()

redisClient.on('error', (err) => {
  console.error('Redis Error:', err)
})

redisClient.on('connect', () => {
  console.log('Redis client connected')
});

// Conectar al servidor Redis
(async () => {
  try {
    await redisClient.connect()
    console.log('Connected to Redis server')
  } catch (err) {
    console.error('Error connecting to Redis:', err)
  }
})()

// Guardar un valor en Redis
exports.set = async (key, value) => {
  const valueFormatted = JSON.stringify(value)
  try {
    await redisClient.set(key, valueFormatted)
    console.log(`Key set: ${key}`)
  } catch (err) {
    console.error('Error setting key in Redis:', err)
    throw err
  }
}

// Obtener un valor de Redis
exports.get = async (key) => {
  try {
    const value = await redisClient.get(key)
    return value ? JSON.parse(value) : null
  } catch (err) {
    console.error('Error getting key from Redis:', err)
    throw err
  }
}

// Cerrar la conexión de Redis al detener el servidor
process.on('SIGINT', async () => {
  try {
    await redisClient.quit()
    console.log('Redis connection closed')
    process.exit(0)
  } catch (err) {
    console.error('Error closing Redis connection:', err)
    process.exit(1)
  }
})
