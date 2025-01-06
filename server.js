const app = require('./src/app/index')
const { initializeConnection } = require('./src/databases/graphsDB')

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
  res.status(200).send({ message: 'hello world' })
}
)

app.listen(PORT, async () => {
  try {
    console.log(`Server is running on http://localhost:${PORT}`)
    await initializeConnection()
  } catch (error) {
    console.log('el error es: ', error)
  }
})
