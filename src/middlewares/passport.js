const passport = require('passport')    
const strategyAuth2_0 = require('passport-oauth2-client-password')
const customStrategy = require('passport-custom')

//autentifica que nuestro cliente sea el deseado

passport.use(new strategyAuth2_0(function(cliendID,clientSecret,done){
    try{        
        if(cliendID !== process.env.SSR_CLIENT || clientSecret !== process.env.SSR_CLIENT_ID){
            //falta middlewares para manejar errores
            const error = 'Cliente Incorrecto'
            throw error
        }
        const client = {id: process.env.ID_SSR_CLIENT, secret: process.env.SCR_CLIENT}
        done(null,client)
    }catch(error){
        done(error)
    }    
}))

//permite contextualizar a la app del usuario(persona en cuestion)

passport.use(new customStrategy(function(req,done){
    // const usrId = función para consultar el id del usuario en cuestión
}))