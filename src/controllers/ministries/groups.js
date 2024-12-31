const serviceGroups = require('../../services/ministries/groups')

exports.createGroups = async (req, res) => {
  try {
    const { latitude, longitude, name, leaderId, strategyName, description } = req.body
    const { churchId } = req.user
    console.log('here data in controller', req.body)
    if (!latitude || !longitude || !name || !leaderId || !strategyName) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.createGroups({ latitude, longitude, name, leaderId, churchId, strategyName, description })
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

exports.getMyInfoGroup = async (req, res) => {
  try {
    const id = req.user.id
    const response = await serviceGroups.getMyInfoGroup(id)
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getMyGroup = async (req, res) => {
  try {
    const id = req.params.groupId
    if (!id) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.getMyGroup(id)
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.addPersonStrategie = async (req, res) => {
  try {
    const { personId, strategyId, rol, groupId } = req.body
    if (!personId || !strategyId || !rol || !groupId) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const leaderId = req.body.leaderId || ''
    const response = await serviceGroups.addPersonStrategie({ personId, strategyId, rol, groupId, leaderId })
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getStrategyById = async (req, res) => {
  try {
    const { strategyId } = req.params
    if (!strategyId) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.getStrategyById(strategyId)
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}

exports.getAttendanceGroup = async (req, res) => {
  try {
    const { groupId, date } = req.params
    if (!groupId || !date) {
      return res.status(400).send({ message: 'Faltan datos' })
    }
    const response = await serviceGroups.getAttendanceGroup({ groupId, date })
    if (response instanceof Error) {
      return res.status(400).send({ message: response.message })
    }
    res.status(200).send(response)
  } catch (e) {
    res.status(500).send(`Ups algo falló en el servidor: ${e.message}`)
  }
}
