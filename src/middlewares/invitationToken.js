const ouath2Services = require('../services/ouath2')

module.exports = async function (req, res, next) {
  let invitationToken = null
  let dataGuest = null
  console.log('catch to verify invitationToken')
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' && req.headers['x-email-token']) {
    invitationToken = req.headers.authorization.split(' ')[1]
  } else if (req.cookies && req.cookies.emailToken) {
    invitationToken = req.cookies.emailToken
  } else if (req.body.emailToken) {
    invitationToken = req.body.emailToken
  }
  console.log('verify invitationToken', invitationToken)
  if (invitationToken) {
    try {
      req.invitationToken = invitationToken
      console.log('payload invitation token: ', invitationToken)
      const statusEmail = await ouath2Services.verifyInvitationsLead(invitationToken)

      if (statusEmail.in_invitations && statusEmail.in_leads_pastor_churches) {
        res.status(400).send({
          message: `Actualmente este correo se encuentra en un proceso de afiliación de para iglesias nuevas y como invitado para un ministerio
                    por favor declina el proceso de afiliación o la invitacion al ministerio al que fuiste invitado
                `
        })
        return
      }
      console.log('this is the status of token:', statusEmail)
      if (statusEmail.in_invitations) {
        console.log('statusEmail in invitations')
        dataGuest = await ouath2Services.getInvitationBoarding(invitationToken)
      } else if (statusEmail.in_leads_pastor_churches) {
        console.log('statusEmail in leads')
        dataGuest = await ouath2Services.verifyChurchLead(invitationToken)
      } else {
        console.log('NO entro en ningunaa jeje')
      }
      if (dataGuest) {
        req.newUser = { ...dataGuest }
      }
    } catch (err) {
      console.log(err)
      return res.status(400).send({ message: err.message })
    }
  }
  await next()
}
