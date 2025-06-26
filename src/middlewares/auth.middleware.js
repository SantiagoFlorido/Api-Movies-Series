//? Importamos de passport-jwt las 2 cositas de aqui abajo
const { ExtractJwt, Strategy } = require('passport-jwt')
//? Importamos de passport el core completo
const passport = require('passport')

//? Importamos nuestro controlador que nos va a permitir validar si el usuario existe en mi db
const { findUserById } = require('../users/users.controllers')
const config = require('../../config').api
 
//? Generamos configuraciones basicas para manejar passport con jwt
const passportConfigs = {
    //? Esta configuracion lo que hace es extraer el Bearer Token de mi peticion
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //? 
    secretOrKey: config.secretOrKey
}


//? done()
passport.use(new Strategy(passportConfigs, (tokenDecoded, done) => {
    findUserById(tokenDecoded.id)
        .then(data => {
            if(data){
               done(null, tokenDecoded) //? El usuario si Existe y es valido
            } else {
               done(null, false, {message: 'Token Incorrect'}) //? El usuario no existe
            }
        })
        .catch(err => {
            done(err, false) //? Error en la base de datos
        })
}))

module.exports = passport.authenticate('jwt', {session: false})