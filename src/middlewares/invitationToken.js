const token = require('jwt-simple')
const ouath2Services = require('../services/ouath2')

module.exports= async function(req,res,next){
    let invitation_token
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer' && req.headers['x-invitation-token']){
        invitation_token = req.headers.authorization.split(' ')[1]        
    }else if (process.env.NODE_ENV === 'develop'){
        console.log('no lo hallo: ',req.headers)
    }
    if(!invitation_token){
        return res.status(401).send({messaage: 'No tienes permisos'})
    }
    try{
    
        const payload = token.decode(invitation_token,process.env.INVITATE_SECRET)        
        req.invitation_token = invitation_token;
        const dataUser = await ouath2Services.invitation_boarding({email: payload.email,status: payload.status})
        if(!dataUser){
            return res.status(400).send('token erroneo')
        }
        req.invitation_token = dataUser;
        
    }catch(err){
        console.log(err);
        console.log('error verificando token')        
    }
    await next();
}
