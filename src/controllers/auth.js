const ouath2Services = require('../services/ouath2')
const moment = require('moment')
const jwt = require('jwt-simple')
const sendEmail = require('../services/sendEmail/email')

async function createAccessToken (data, duration) {
  const payload = {
    sub: data.id,
    rolName: data.rol_name,
    iat: moment().format('X'),
    exp: moment().add(duration, 'seconds').format('X'),
    ouathId: process.env.SSR_CLIENT_ID
  }
  const token = jwt.encode(payload, process.env.JWT_SECRET, 'HS256')
  return token
}

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
    const accesToken = await createAccessToken({ id: result.userId, rolName: result.rolName }, duration)

    const durationRefresh = 60 * 60 * 24 * 3 // 3 días
    const newRefreshToken = await ouath2Services.createRefreshToken({
      refreshTokenId: result.refresh_token_id,
      userId: result.userId,
      created: moment().format('X'),
      expires: durationRefresh
    })

    res.cookie('access_token', accesToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: duration * 2 * 100,
      samesite: process.env.NODE_ENV === 'production' ? process.env.CLIENT_HOST : 'localhost'
    })

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: durationRefresh * 1000,
      samesite: process.env.NODE_ENV === 'production' ? process.env.CLIENT_HOST : 'localhost'
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

    const { password } = req.body
    const { church_id: churchId, person_id: personId } = req.newUser
    console.log('this is the personId: ', personId)
    console.log('this is the churchId: ', churchId)
    console.log('this is the rol: ', req.newUser.rol_name)
    const rol = req.newUser.rol_name
    if (!password) {
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
    const result = await ouath2Services.singUp({ personId, password, rol })

    if (!result) {
      res.status(500).send({ message: result })
    }
    res.status(200).send({ message: result })
  } catch (e) {
    console.error('Error en sigUp: ', e)
    res.status(500).send({ message: 'Error interno del servidor', error: e.message })
  }
}

exports.setPassword = async (req, res) => {
  try {
    const { password, newPassword, personId } = req.body
    if (!password || !newPassword || !personId) {
      res.status(400).send({ message: 'Faltan Datos' })
      return
    }
    const result = await ouath2Services.setPassword({ password, newPassword, personId })
    if (!result) {
      res.status(500).send({ message: result })
      return
    }
    res.status(200).send({ message: result })
  } catch (e) {
    console.error('Error en setPassword: ', e)
    res.status(500).send({ message: 'Error interno del servidor', error: e.message })
  }
}

exports.sigIn = async (req, res) => {
  try {
    console.log('entro a singIn')
    console.log('req.body: ', req.body)
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
    const duration = 60 * 7 // 7 min
    const accessToken = await createAccessToken({ id: result.id, rolName: result.rol_name }, duration)
    const durationRefresh = 60 * 60 * 24 * 27 // 27 días
    const refreshToken = await ouath2Services.createRefreshToken({
      userId: result.id,
      created: moment().format('X'),
      expires: durationRefresh
    })
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: duration * 1000,
      samesite: process.env.NODE_ENV === 'production' ? process.env.CLIENT_HOST : 'localhost'
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: durationRefresh * 1000,
      samesite: process.env.NODE_ENV === 'production' ? process.env.CLIENT_HOST : 'localhost'
    })
    console.log('result of singIn: ', result)
    const userData = {
      name: result.first_name + ' ' + result.last_name,
      email: result.email,
      rol: result.rol_name,
      churchName: result.church_name,
      avatar: result.avatar
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

exports.singOut = async (req, res) => {
  try {
    console.log('entro a singOut')
    console.log('req.cookies: ', req.cookies)
    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) {
      res.status(401).send({ message: 'No tienes permisos' })
      return
    }
    const result = await ouath2Services.deleteRefreshToken(refreshToken)
    if (result instanceof Error) {
      res.status(401).send({ message: result.message })
      return
    }
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
    res.status(200).send({ message: 'Cierre de sesión exitoso' })
  } catch (err) {
    console.error('Error en singOut: ', err)
    res.status(500).send({ message: 'Error interno del servidor', error: err.message })
  }
}

exports.createInvitationBoarding = async (req, res) => {
  try {
    const { id: personId, email } = req.body
    console.log('req.body in createInvitationBoarding: ', req.body)
    // Verificar si el email no está definido
    if (!email) {
      return res.status(400).send('No proporcionaste el email')
    }
    const duration = 60 * 60 * 24 * 27 // 27 días
    const created = moment().format('X')
    const expires = moment().add(duration, 'seconds').format('X')
    const inviterId = req.user.id
    const inviterName = req.user.firstName + req.user.lastName

    console.log('Going into createInvitationBoarding')
    const result = await ouath2Services.createInvitationBoarding(personId, inviterId, created, expires)

    if (result instanceof Error) {
      res.status(400).send({ message: result.message })
      return
    }
    console.log('result of createInvitationBoarding: ', result)
    const payload = {
      tokenId: result.person_id,
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
      res.status(400).sendd('Ups algo salio mal, intenta nuevamente')
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

    const result = await ouath2Services.acceptInvitation(invitate.person_id)
    if (result instanceof Error) {
      res.status(401).send({ message: 'No Haz sido invitado' })
      return
    }

    res.status(200).send({ message: 'Ya Haz sido aceptado', email: invitate.email })
  } catch (e) {
    console.log(e)
    res.status(400).send({ message: `Ups hubo un error ${e.message}` })
  }
}

exports.verifyChurchLead = async (req, res) => {
  try {
    console.log('verifyChurchLead')
    console.log('req.newUser', req.newUser)
    const { person_id: personId } = req.newUser
    if (!personId) {
      res.status(400).send('No tienes credenciales para estar aqui')
      return
    }
    const result = await ouath2Services.verifyChurchLead(personId)
    if (result instanceof Error) {
      res.status(401).send('No tienes ninguna peticion de afiliacion')
      return
    }

    res.status(200).send({ message: 'Ya Haz sido aceptado' })
  } catch (e) {
    console.log(e)
    res.status(500).sned('Ups algo fallo en el servidor,', e)
  }
}
// haz algo escribe algo que me deje ver un console.log
