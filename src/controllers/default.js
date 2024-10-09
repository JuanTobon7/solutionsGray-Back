const defaultServices = require('../services/default')
const sendEmail = require('../services/sendEmail/email')

exports.savePeople = async (req, res) => {
  try {
    console.log('hey wa happen', req.body)
    const { state_id: stateId, email, first_name: firstName, last_name: lastName, cc, phone, type_person_id: typePerson } = req.body
    if (!stateId || !email || !firstName || !lastName || !cc || !phone || !typePerson) {
      console.log('Datos faltantes here')
      console.log('stateId', stateId)
      console.log('email', email)
      console.log('firstName', firstName)
      console.log('lastName', lastName)
      console.log('cc', cc)
      console.log('phone', phone)
      console.log('typePerson', typePerson)
      console.log('req.body', req.body)
      res.status(400).send('Datos faltantes here')
      return
    }
    const churchId = req.user.churchId
    const result = await defaultServices.savePeople({ stateId, email, firstName, lastName, cc, phone, typePerson, churchId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}

exports.sendLead = async (req, res) => {
  try {
    const { churchName, stateId, email, firstName, lastName, phone, personId } = req.body
    if (!churchName || !stateId || !email || !firstName || !lastName || !phone || !personId) {
      res.status(400).send('Datos faltantes')
      return
    }
    const result = await defaultServices.sendLead({ personId, churchName })
    if (result instanceof Error) {
      res.status(400).send(`ups algo al enviar el email ${sendLead.message}`)
      return
    }

    const pastorName = firstName + ' ' + lastName
    const sendLead = await sendEmail.sendLead({ churchName, stateId, email, pastorName })
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

exports.getCurrency = async (req, res) => {
  try {
    console.log('entro')
    const result = await defaultServices.getCurrency()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
