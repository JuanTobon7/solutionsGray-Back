const jwt = require('jwt-simple')
const user = require('../services/user')

module.exports = async function (req,res,next){
    let token    
    if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer'  && req.headers['x-access-token']){
        token = req.headers.authorization.split(' ')[1]        
    }else if (process.env.NODE_ENV === 'develop'){
        console.log('No tienes JWT',req.headers,'req auth: ',req.headers.authorization)
    }
    if(token){
        try{
            const payload = jwt.decode(token,process.env.JWT_SECRET)                        
            req.token = token;
            const dataUser = await user.findById(payload.sub);
            if(!dataUser){
                res.status(400).send('token erroneo')
            }

            req.user = dataUser;
            
        }catch(err){
            console.log(err);
            return res.status(400).send({message: err.message})
        }
    }
    await next();
}
