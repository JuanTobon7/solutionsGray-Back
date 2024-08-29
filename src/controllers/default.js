const defaultServices = require('../services/default')
const sendEmail = require('../services/sendEmail/email')

async function savePeople (data) {
  try {
    const { stateId, email, firstName, lastName, cc, phone, rol, churchId } = data
    if (!stateId || !email || !firstName || !lastName || !cc || !phone || !rol) {
      return new Error('Datos faltantes')
    }
    const result = await defaultServices.savePeople({ stateId, email, firstName, lastName, cc, phone, rol, churchId })
    console.log(result)
    if (result instanceof Error) {
      return result
    }
    return 'Se ha registrado a la persona con exito'
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.log(e.message)
    }
  }
}

exports.savePeople = async (req, res) => {
  try {
    const { stateId, email, firstName, lastName, cc, phone } = req.body
    const rol = 'Nuevo'
    if (!stateId || !email || !firstName || !lastName || !cc || !phone) {
      res.status(400).send('Datos faltantes here')
      return
    }
    const churchId = req.user.churchId
    const result = await savePeople({ stateId, email, firstName, lastName, cc, phone, rol, churchId })

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
    const { churchName, stateId, email, firstName, lastName, cc, phone } = req.body
    const rol = 'Lead pastor'
    if (!churchName || !stateId || !email || !firstName || !lastName || !cc || !phone) {
      res.status(400).send('Datos faltantes')
      return
    }

    let result = await savePeople({ stateId, email, firstName, lastName, cc, phone, rol })
    console.log(result)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    result = await defaultServices.sendLead({ id: result.id, churchName })
    const pastorName = firstName + ' ' + lastName
    const sendLead = await sendEmail.sendLead({ churchName, stateId, email, pastorName, token: result.token })
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

exports.registerAttends = async (req, res) => {
  try {
    const { stateId, email, firstName, lastName, cc, phone } = req.body
    const rol = 'Nuevo'
    if (!stateId || !email || !firstName || !lastName || !cc || !phone) {
      res.status(400).send('Datos faltantes')
      return
    }

    const result = await savePeople({ stateId, email, firstName, lastName, cc, phone, rol })
    console.log(result)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
