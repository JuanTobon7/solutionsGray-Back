const token = require('jwt-simple')
const ouath2Services = require('../services/ouath2')

module.exports= async function(req,res,next){
    let invitation_token = null, dataGuest
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' && req.headers['x-email-token']){
        invitation_token = req.headers.authorization.split(' ')[1]        
    }else if (process.env.NODE_ENV === 'develop'){
        console.log('no lo hallo: ',req.headers)
    }
    if(invitation_token){        
        try{
            const payload = token.decode(invitation_token,process.env.INVITATE_SECRET)        
            req.invitation_token = invitation_token;
            const statusEmail = await ouath2Services.verifyInvitationsLead(payload.email);
            
           if(statusEmail.in_invitations && statusEmail.in_leads_pastor_churches){
            return res.status(400).send(`Actualmente este correo se encuentra en un proceso de afiliación de para iglesias nuevas y como invitado para un ministerio
                    por favor declina el proceso de afiliación o la invitacion al ministerio al que fuiste invitado
                `)
           }
           console.log(statusEmail) 
           if(statusEmail.in_invitations){
                console.log('statusEmail in invitations')
                dataGuest = await ouath2Services.getInvitationBoarding(payload.email)
           }else if(statusEmail.in_leads_pastor_churches){
                console.log('statusEmail in leads')
               dataGuest = await ouath2Services.verifyChurchLead(payload.email)
           }else{
            console.log('NO entro en ningunaa jeje')
           }
            req.newUser = {...dataGuest}
        }catch(err){
            console.log(err);
            return res.status(400).send({message: err.message})
        }    
    }
    await next();
}
