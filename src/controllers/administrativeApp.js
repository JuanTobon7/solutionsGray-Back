const administrativeAppServices = require('../services/administrativeApp')
const sendEmail = require('../services/sendEmail/email')

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
    const { status, churchName, email, firstName, lastName } = req.body
    if (!leadId || !status || !churchName || !email || !firstName || !lastName) {
      res.status(400).send({ message: 'Faltan Datos' })
      return
    }
    const result = await administrativeAppServices.updateLead({ leadId, status })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    // send email hacer condicional
    res.status(200).send(result)
    if (status !== 'Aprobado') { return 0 }
    sendEmail.sendAprobeLead({ churchName, email, firstName, lastName, token: leadId })
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
