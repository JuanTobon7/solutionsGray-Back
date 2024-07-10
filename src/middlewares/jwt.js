const jwt = require('jwt-simple')
const user = require('../services/user')

module.exports = async function (req,res,next){
    let token    
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'){
        token = req.headers.authorization.split(' ')[1]        
    }else if (process.env.NODE_ENV === 'develop'){
        console.log('no lo hallo: ',req.headers)
    }
    if(token){
        try{
            const payload = jwt.decode(token,process.env.JWT_SECRET)
            console.log('\ntoken recibido en la request:\n',token,'\npayload:\n',payload)
            req.token = token;
            const dataUser = await user.findById(payload.idsr);
            if(!dataUser){
                res.status(400).send('token erroneo')
            }
            req.user = dataUser;
            
        }catch(err){
            console.log(err);
            console.log('error verificando token')
        }
    }
    await next();
}
