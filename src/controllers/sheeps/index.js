const serviceDefault = require('../../services/sheeps/index')

exports.getSheepsByServant = async (req, res) => {
  try {
    const { servantId } = req.params
    const { churchId } = req.user
    if (!servantId) {
      res.status(400).send('No se pudo acceder a las credenciales')
      return
    }

    const result = await serviceDefault.getSheepsByServant({ servantId, churchId })
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

exports.resgisterVisits = async (req, res) => {
  try {
    console.log('req.body here in registerVisits', req.body)
    const { date, description, sheepId, userTimeZone } = req.body
    if (!date || !description || !sheepId || !userTimeZone) {
      res.status(400).send('Faltan datos para registrar la visita')
      return
    }
    const response = await serviceDefault.registerVisits({ date, description, sheepId })
    if (response instanceof Error) {
      res.status(400).send({ message: response.message })
      return
    }
    res.status(200).send({ message: 'Se ha registrado exitosamente la visita a la oveja' })
  } catch (e) {
    console.log(e)
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
