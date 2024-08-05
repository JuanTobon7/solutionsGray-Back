const passport = require('passport')
const StrategyAuth = require('passport-oauth2-client-password')
const CustomStrategy = require('passport-custom')
// const userService = require('../services/user')
const oauth2Service = require('../services/ouath2')
// autentifica que nuestro cliente sea el deseado

passport.use(new StrategyAuth(function (cliendID, clientSecret, done) {
  try {
    console.log('entro a login jeje')
    if (cliendID !== process.env.SSR_CLIENT_ID || clientSecret !== process.env.SSR_CLIENT) {
      // falta middlewares para manejar errores
      console.log('No son')
      const error = 'Cliente Incorrecto'
      throw error
    }
    const client = { id: process.env.ID_SSR_CLIENT, secret: process.env.SCR_CLIENT }
    done(null, client)
  } catch (error) {
    done(error)
  }
}))
// refresh token
passport.use('rtoken', new CustomStrategy(async function (request, done) {
  try {
    if (request.body.grant_type === 'refresh_token' && request.body.refresh_token) {
      const data = await oauth2Service.getInfoFromValidToken(request.body.refresh_token)
      if (!data) {
        const error = new Error('Informacion de session no encontrada')
        error.status = 401
        throw error
      }
      done(null, {
        userId: data.userId,
        clientId: data.clientId
      })
    } else {
      const error = new Error('No compatible con refresh token')
      error.status = 401
      throw error
    }
  } catch (err) {
    done(err)
  }
}))

/**
  permite contextualizar a la app del usuario(persona en cuestion)
passport.serializeUser((user, done) => {
    done(null, user.client_id);
  });

passport.deserializeUser(async (id, done) => {
    const user = await userService.findById(id);
    if(user == 'id equivocado'){
      done(user.error);
    }
    done(null, user);
});
**/

module.exports = passport
