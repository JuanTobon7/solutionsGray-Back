const defaultServices = require('../services/default')
const sendEmail = require('../services/sendEmail/email')

exports.sendLead = async (req, res) => {
  try {
    const { churchName, stateId, email, firstName, lastName, phone, personId } = req.body
    console.log('req.body', req.body)
    if (!churchName || !stateId || !email || !firstName || !lastName || !phone || !personId) {
      res.status(400).send('Datos faltantes')
      return
    }
    const result = await defaultServices.sendLead({ personId, churchName })
    if (result instanceof Error) {
      res.status(400).send(`ups algo al enviar el email ${result.message}`)
      return
    }

    const pastorName = firstName + ' ' + lastName
    const sendLead = sendEmail.sendLead({ churchName, stateId, email, pastorName, token: personId })
    if (sendLead instanceof Error) {
      res.status(400).send(`ups algo al enviar el email ${sendLead.message}`)
      return
    }
    res.status(200).send('Se ha guardado tu peticion, pronto te contactaremos')
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log(e.message)
    }
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}

exports.getCountries = async (req, res) => {
  const result = await defaultServices.getCountries()
  if (result instanceof Error) {
    res.status(400).send({ message: result.message })
    return
  }
  res.status(200).send(result)
}

exports.getStates = async (req, res) => {
  try {
    const { countryId } = req.params
    const result = await defaultServices.getStates(countryId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
