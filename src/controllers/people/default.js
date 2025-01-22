const peopleServices = require('../../services/people/default')

exports.savePeople = async (req, res) => {
  try {
    console.log('hey wa happen in Save People', req.user)
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

    const churchId = req.user?.churchId ?? null

    console.log('churchId', churchId)
    const result = await peopleServices.savePeople({ stateId, email, firstName, lastName, cc, phone, typePerson, churchId })

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }

    res.status(200).send(result)
  } catch (e) {
    res.status(500).send(`Ups algo fallo en el servidor ${e.message}`)
  }
}

exports.getPeople = async (req, res) => {
  try {
    const { churchId } = req.user
    if (!churchId) {
      res.status(400).send({ message: 'No se pudo acceder a las credenciales' })
      return
    }
    const result = await peopleServices.getPeople(churchId)
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

exports.getTypesPeople = async (req, res) => {
  try {
    console.log('coming here types')
    const result = await peopleServices.getTypesPeople()
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
