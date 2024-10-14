const serviceDefault = require('../../../services/people/sheeps')

exports.registerSheeps = async (req, res) => {
  try {
    console.log('req.body here in registerSheeps', req.body)
    const { personId, description, guideId } = req.body
    if (!personId || !description || !guideId) {
      res.status(400).send('Faltan datos para iniciar un proceso de acompañamiento con la persona en cuestion')
      return
    }

    const result = await serviceDefault.registerSheep({ personId, description, guideId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
    }

    res.status(200).send('Se ha iniciado un proceso de acompañamiento con la persona inscrita')
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

exports.getSheeps = async (req, res) => {
  try {
    console.log('coming here sheeps')
    const { churchId } = req.user
    if (!churchId) {
      throw new Error('No se pudo acceder a las credenciales')
    }

    const result = await serviceDefault.getSheeps(churchId)
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

exports.getSheep = async (req, res) => {
  try {
    const { id } = req.params
    const churchId = req.user.churchId
    if (!id) {
      res.status(400).send('No se pudo acceder a las credenciales')
      return
    }

    const result = await serviceDefault.getSheep({ id, churchId })
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

exports.getMySheeps = async (req, res) => {
  try {
    const { id } = req.user
    const { churchId } = req.user
    console.log('aqui toi en mySheeps', id, churchId)
    const result = await serviceDefault.getMySheeps({ id, churchId })
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

exports.getVisits = async (req, res) => {
  try {
    const { sheepId } = req.params
    if (!sheepId) {
      res.status(400).send('Faltan datos para obtener las visitas')
    }
    const result = await serviceDefault.getVisits(sheepId)
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
