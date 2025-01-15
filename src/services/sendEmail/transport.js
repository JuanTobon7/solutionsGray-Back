// brevoConfig.js
const brevo = require('@getbrevo/brevo')

// Crear una instancia de la API de Brevo
const apiBrevoInstance = new brevo.TransactionalEmailsApi()

// Establecer la clave API de Brevo
apiBrevoInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

// Función para enviar un correo electrónico
const sendEmail = async (emailData) => {
  const sendSmtpEmail = new brevo.SendSmtpEmail()

  sendSmtpEmail.to = emailData.to
  sendSmtpEmail.sender = emailData.sender
  sendSmtpEmail.subject = emailData.subject
  sendSmtpEmail.htmlContent = emailData.htmlContent

  try {
    const response = apiBrevoInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Correo electrónico enviado:', response)
    return response
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error)
    throw error
  }
}

module.exports = { sendEmail }
