
const { findUserByEmail } = require('../users/users.controllers')
const { comparePassword } = require('../utils/crypto')
//? son funciones asincronas
//? retornan informacion

const checkUserCredentials = async(email, password) => {
    try {
        const user = await findUserByEmail(email)
        const verifyPassword = comparePassword(password, user.password)
        if(verifyPassword){
            return user
        } else {
            return false
        }
    } catch (error) {
        return false
    }
}

//? Las credenciales son exitosas -> User
//! Las credenciales sean fallidas -> false

module.exports = checkUserCredentials