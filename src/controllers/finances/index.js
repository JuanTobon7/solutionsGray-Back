const serviceDefault = require('../../services/finances/index')

exports.getTypesContributions = async (req, res) => {
  try {
    console.log('coming here types')
    const result = await serviceDefault.getTypesContributions()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.saveContribution = async (req, res) => {
  try {
    console.log('req.body here in saveContribution', req.body)
    const { personId, eventId, currencyId, offerings } = req.body
    if (!personId || !eventId || !currencyId || !offerings) {
      res.status(400).send('Faltan datos para registrar la contribución')
      return
    }
    let result = await serviceDefault.saveContributions({ personId, eventId, currencyId })
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    const contributionId = result.id
    const saveDetails = async () => {
      for (let i = 0; i < offerings.length; i++) {
        const { type, amount } = offerings[i]
        result = await serviceDefault.saveDetailsContributions({ contributionId, type, amount })
      }
    }
    saveDetails()

    res.status(200).send({ message: 'Se ha registrado exitosamente la contribución' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getOfferings = async (req, res) => {
  try {
    const { eventId } = req.params
    if (!eventId) {
      res.status(400).send('Faltan datos para obtener las ofrendas')
    }
    const result = await serviceDefault.getOfferings(eventId)
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getCurrency = async (req, res) => {
  try {
    console.log('entro')
    const result = await serviceDefault.getCurrency()
    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}
