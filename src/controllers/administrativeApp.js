const administrativeAppServices = require('../services/administrativeApp')

exports.getLeads = async (req, res) => {
  try {
    console.log('getLeads')
    const result = await administrativeAppServices.getLeads()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}

exports.updateLead = async (req, res) => {
  try {
    const { leadId } = req.params
    const status = req.body.status
    if (!leadId || !status) {
      res.status(400).send({ message: 'Faltan Datos' })
      return
    }
    const result = await administrativeAppServices.updateLead({ leadId, status })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
