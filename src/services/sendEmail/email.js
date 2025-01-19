const path = require('path')
const handlebars = require('handlebars')
const fs = require('fs')
const { sendEmail } = require('./transport') // Usa la función sendEmail que exportamos desde brevoConfig

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

// Función para enviar invitaciones
exports.sendInvitationOnBoarding = async (data) => {
  try {
    console.log('Enviando invitación de onboarding')
    const { churchName, email, token, inviterName } = data
    const htmlToSend = compileTemplate('invitationBoarding', { churchName, token, inviterName })
    const emailData = {
      to: [{ email }], // Recipiente del correo
      sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado en Brevo
      subject: `Ven y Haz Parte del Ministerio ${churchName}`,
      htmlContent: htmlToSend
    }
    const result = sendEmail(emailData) // Usamos la función sendEmail para enviar el correo
    if (!result) {
      throw new Error('Algo falló al enviar la invitación')
    }
    return result
  } catch (error) {
    console.error('Error en sendInvitationOnBoarding:', error)
    throw error
  }
}

// Función para enviar leads
exports.sendLead = async (data) => {
  try {
    const { churchName, pastorName, email, countryId, token } = data
    const htmlToSend = compileTemplate('leadsChurch', { churchName, pastorName, email, countryId, token })
    const emailData = {
      to: [{ email: process.env.EMAIL_ATTEND }], // Recipiente del correo
      sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado
      subject: `Nuevo lead de la iglesia ${churchName}`,
      htmlContent: htmlToSend
    }
    const result = sendEmail(emailData) // Usamos la función sendEmail para enviar el correo
    console.log('Correo enviado:', result)
    if (!result) {
      throw new Error('Algo falló al enviar el lead')
    }
    return result
  } catch (error) {
    console.error('Error en sendLead:', error)
    return error
  }
}

// Función para asignar servicios
exports.sendAssignedService = async (data) => {
  try {
    const { servantName, rolServantName, churchName, date, eventName, servantEmail } = data
    if (!servantName || !rolServantName || !date || !eventName || !churchName || !servantEmail) {
      throw new Error('Faltan datos necesarios')
    }
    const htmlToSend = compileTemplate('assignedService', { servantName, rolServantName, churchName, date, eventName, servantEmail })
    const emailData = {
      to: [{ email: servantEmail }], // Recipiente del correo
      sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado
      subject: `Asignación de servicio: ${eventName}`,
      htmlContent: htmlToSend
    }
    const result = await sendEmail(emailData) // Usamos la función sendEmail para enviar el correo
    if (!result) {
      throw new Error('Algo falló al enviar la asignación')
    }
    return result
  } catch (error) {
    console.error('Error en sendAssignedService:', error)
    throw error
  }
}

exports.sendAprobeLead = async (data) => {
  const { churchName, email, firstName, lastName, token } = data
  const htmlToSend = compileTemplate('aprobeLead', { churchName, firstName, lastName, token })
  const emailData = {
    to: [{ email }], // Recipiente del correo
    sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado
    subject: 'Bienvenido a Brevo',
    htmlContent: htmlToSend
  }
  sendEmail(emailData)
}

exports.sendForgotPassword = async (data) => {
  const { email, firstName, lastName, code } = data
  if (!email || !firstName || !lastName || !code) {
    return new Error('Faltan datos necesarios')
  }
  const htmlToSend = compileTemplate('forgotPassword', { firstName, lastName, code })
  const emailData = {
    to: [{ email }], // Recipiente del correo
    sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado
    subject: 'Recuperación de contraseña',
    htmlContent: htmlToSend
  }
  sendEmail(emailData)
}

exports.notificationWorshipService = async (data) => {
  const { worshipServiceName, typeWorshipName, date, hour, emails } = data
  console.log('Enviando notificación de servicio', data)
  const htmlToSend = compileTemplate('worshipNotification', { worshipServiceName, typeWorshipName, date, hour })
  const emailData = {
    to: emails, // Recipiente del correo
    sender: { email: process.env.USER_EMAIL_INVITATION }, // Correo remitente verificado
    subject: `Notificación de Servicio: ${worshipServiceName}`,
    htmlContent: htmlToSend
  }
  sendEmail(emailData)
}
