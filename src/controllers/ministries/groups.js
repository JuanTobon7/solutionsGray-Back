const serviceGroups = require('../../services/ministries/groups')

exports.createGroups = async (req, res) => {
  try {
    const { latitude, longitude, name, leaderId } = req.body
    const { churchId } = req.user
    console.log('here data in controller', req.body)
    if (!latitude || !longitude || !name || !leaderId) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.createGroups({ latitude, longitude, name, leaderId, churchId })
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getGroups = async (req, res) => {
  try {
    const { churchId } = req.user
    const response = await serviceGroups.getGroups(churchId)
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
