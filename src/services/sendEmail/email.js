const path = require('path')
const handlebars = require('handlebars')
const fs = require('fs')
const transporter = require('./transport')

// Función para leer y compilar la plantilla
const compileTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, '../../templates', `${templateName}.html`)
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`)
    }
    const source = fs.readFileSync(filePath, 'utf8')
    const template = handlebars.compile(source)
    return template(data)
  } catch (error) {
    console.error(`Error leyendo la plantilla desde ${filePath}:`, error)
    throw error
  }
}

exports.sendInvitationOnBoarding = async (data) => {
  try {
    console.log('i\'m in sendInvitationOnBoarding')
    const { churchName, email, token, inviterName } = data
    const htmlToSend = compileTemplate('invitationBoarding', { churchName, token, inviterName })
    const mailOptions = {
      from: process.env.USER_EMAIL_INVITATION,
      to: email,
      subject: `Ven y Haz Parte del Ministerio ${churchName}`,
      html: htmlToSend
    }
    const result = await transporter.transporterGmail.sendMail(mailOptions)

    if (!result) {
      throw new Error('Algo falló al enviar la invitación')
    }
    return result
  } catch (error) {
    console.error('Error en sendInvitationOnBoarding:', error)
  }
}

exports.sendLead = async (data) => {
  try {
    const { churchName, pastorName, email, countryId, token } = data
    const htmlToSend = compileTemplate('leadsChurch', { churchName, pastorName, email, countryId, token })
    const mailOptions = {
      from: process.env.USER_EMAIL_INVITATION,
      to: process.env.EMAIL_ATTEND,
      html: htmlToSend
    }
    const result = await transporter.transporterGmail.sendMail(mailOptions)
    if (!result) {
      throw new Error('Algo falló al enviar la invitación')
    }
    return result
  } catch (error) {
    console.error('Error en sendLead:', error)
    return error
  }
}

exports.sendAssignedService = async (data) => {
  try {
    const { servantName, rolServantName, churchName, date, eventName, servantEmail } = data
    if (!servantName || !rolServantName || !date || !eventName || !churchName || !servantEmail) {
      return new Error('Faltan Datos')
    }
    const htmlToSend = compileTemplate('assignedService', { servantName, rolServantName, churchName, date, eventName, servantEmail })
    const mailOptions = {
      from: process.env.USER_EMAIL_INVITATION,
      to: servantEmail,
      html: htmlToSend
    }
    const result = await transporter.transporterGmail.sendMail(mailOptions)
    if (!result) {
      throw new Error('Algo falló al enviar la invitación')
    }
    return result
  } catch (e) {
    return new Error('Ups algo fallo en el proceso de enviar correo', e)
  }
}
