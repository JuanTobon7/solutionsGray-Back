const ouath2Services = require('../services/ouath2')
const moment = require('moment')
const jwt = require('jwt-simple')
const sendEmail = require('../services/sendEmail/email')

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) {
      res.status(401).send({ message: 'No tienes permisos' })
      return
    }
    const result = await ouath2Services.getInfoFromValidToken(refreshToken)
    if (result instanceof Error) {
      res.status(401).send({ message: result.message })
      return
    }
    if (result.expiresAt < moment().format('X')) {
      return res.status(401).send({ message: 'El token ha expirado' })
    }
    const duration = 60 * 2 // 20 min
    const payload = {
      sub: result.userId,
      rolName: result.rolName,
      iat: moment().format('X'),
      exp: moment().add(duration, 'seconds').format('X'),
      ouathId: process.env.SSR_CLIENT_ID
    }
    const token = jwt.encode(payload, process.env.JWT_SECRET, 'HS256')
    const durationRefresh = 60 * 60 * 24 * 3 // 3 días
    const newRefreshToken = await ouath2Services.createRefreshToken({
      userId: payload.sub,
      created: payload.iat,
      expires: durationRefresh
    })
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: duration * 2 * 1000
    })

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: durationRefresh * 1000
    })
    res.status(200).send({ message: 'Token actualizado' })
  } catch (err) {
    console.error('Error en refreshToken: ', err)
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}

exports.singUp = async (req, res) => {
  try {
    console.log('entramos a singUp ctrl')

    const { cc, name, email, password, countryId, phoneNumber } = req.body
    const churchId = req.newUser.church_id
    console.log('this is churchId:', churchId)
    const rol = req.newUser.rol_name
    if (!cc || !name || !email || !password || !countryId || !phoneNumber) {
      const error = new Error('Faltan Datos')
      res.status(400).send({ message: error })
      return
    }

    if (req.newUser.rol_name !== 'Pastor' && !churchId) {
      console.log('tamos aqui')
      const error = new Error('Faltan Datos')
      res.status(400).send({ message: error })
      return
    }
    console.log('here here here here go go go')
    const result = await ouath2Services.singUp({ cc, name, email, password, countryId, churchId, phoneNumber, rol })

    if (!result) {
      res.status(500).send({ message: result })
    }
    res.status(200).send({ message: result })
  } catch (e) {
    console.error('Error en sigUp: ', e)
    res.status(500).send({ message: 'Error interno del servidor', error: e.message })
  }
}

exports.sigIn = async (req, res) => {
  try {
    console.log('entro a singIn')
    const { email, password } = req.body
    if (!email || !password) {
      const error = new Error('Datos faltantes')
      res.status(400).send({ message: error })
    }

    const result = await ouath2Services.singIn(email, password)
    if (result instanceof Error) {
      res.status(401).send({ message: result.message })
      return
    }
    const duration = 10 // 10 seg
    const payload = {
      sub: result.id,
      rolName: result.rol_name,
      iat: moment().format('X'),
      exp: moment().add(duration, 'seconds').format('X'),
      ouathId: process.env.SSR_CLIENT_ID
    }
    const token = jwt.encode(payload, process.env.JWT_SECRET, 'HS256')
    const durationRefresh = 60 * 60 * 24 * 27 // 27 días
    const refreshToken = await ouath2Services.createRefreshToken({
      userId: payload.sub,
      created: payload.iat,
      expires: durationRefresh
    })
    const durationToken = 60 * 10 // 10 minutos
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: durationToken * 1000
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: durationRefresh * 1000
    })

    const userData = {
      name: result.name,
      email: result.email,
      rol: result.rol_name
    }
    const response = {
      ...userData,
      message: 'Inicio de sesión exitoso'
    }
    console.log('user data information to front: ', userData)
    res.status(200).send(response)
  } catch (err) {
    console.error('Error en sigIn: ', err)
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}

exports.createInvitationBoarding = async (req, res) => {
  try {
    const { email } = req.body
    // Verificar si el email no está definido
    if (!email) {
      return res.status(400).send('No proporcionaste el email')
    }
    const inviterName = req.user.name
    const duration = 60 * 60 * 24 * 27 // 27 días
    const created = moment().format('X')
    const expires = moment().add(duration, 'seconds').format('X')
    const inviterId = req.user.id
    console.log('Going into createInvitationBoarding')
    const result = await ouath2Services.createInvitationBoarding(email, inviterId, created, expires)

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result of createInvitationBoarding: ', result)
    const payload = {
      tokenId: result.id,
      duration,
      created,
      expires,
      inviterId
    }

    console.log('payload of invitation token: ', payload)

    const token = jwt.encode(payload, process.env.INVITATE_SECRET, 'HS256')

    const churchName = req.user.churchName
    console.log('Going into sendEmail')
    const invitation = await sendEmail.sendInvitationOnBoarding({ email, churchName, token, inviterName })
    if (!invitation) {
      res.status(400).send('Ups algo salio mal, intenta nuevamente')
    }

    res.status(200).send({ message: ' Invitación enviada exitosamente' })
  } catch (err) {
    console.error('Error en createInvitation: ', err)
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}

exports.acceptInvitation = async (req, res) => {
  try {
    const invitate = req.newUser
    console.log('invitate: ', invitate)
    if (!invitate) {
      res.status(400).send({ message: 'No tienes credenciales para estar aqui' })
      return
    }

    if (invitate.status === 'accept') {
      res.status(200).send({ message: 'Ya Haz sido aceptado' })
      return
    }

    const result = await ouath2Services.acceptInvitation(invitate.email)
    if (result instanceof Error) {
      res.status(401).send({ message: 'No Haz sido invitado' })
      return
    }

    res.status(200).send({ message: 'Ya Haz sido aceptado' })
  } catch (e) {
    console.log(e)
    res.status(400).send({ message: `Ups hubo un error ${e.message}` })
  }
}

exports.verifyChurchLead = async (req, res) => {
  try {
    const { email } = req.newUser
    if (!email) {
      res.status(400).send('No fue proporcionado ningún email')
      return
    }
    const result = await ouath2Services.verifyChurchLead(email)
    if (result instanceof Error) {
      res.status(401).send('No tienes ninguna peticion de afiliacion')
      return
    }

    res.status(200).send({ message: 'Verificado Exitosamente' })
  } catch (e) {
    console.log(e)
    res.status(500).sned('Ups algo fallo en el servidor,', e)
  }
}
// haz algo escribe algo que me deje ver un console.log
