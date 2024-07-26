const jwt = require('jwt-simple')
const user = require('../services/user')

module.exports = async function (req, res, next) {
  let token
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' && req.headers['x-access-token']) {
    token = req.headers.authorization.split(' ')[1]
  } else if (process.env.NODE_ENV === 'develop') {
    console.log('No tienes JWT')
  }
  if (token) {
    try {
      const payload = jwt.decode(token, process.env.JWT_SECRET)
      req.token = token
      console.log(payload)
      const dataUser = await user.findById(payload.sub)
      if (dataUser instanceof Error) {
        res.status(400).send({ message: dataUser.message })
        return
      }
      req.user = dataUser
      console.log('here here here req.user', req.user)
    } catch (err) {
      console.log(err)
      return res.status(400).send({ message: err.message })
    }
  }
  await next()
}
