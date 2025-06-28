const usersControllers = require('./users.controllers')
const responses = require('../utils/handleResponses')
const { hashPassword } = require('../utils/crypto')

const getAllUsers = (req, res) => {
    usersControllers.findAllUser()
        .then(data => {
            responses.success({
                status: 200,
                data: data,
                message: 'Getting all Users',
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Something bad getting all users',
                res
            })
        })
}

const getUserById = (req, res) => {
    const id = req.params.id 
    usersControllers.findUserById(id)
        .then(data => {
            if(data){
                responses.success({
                    status: 200,
                    data,
                    message: `Getting User with id: ${id}`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `User with ID: ${id}, not found`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: 'Something bad getting the user',
                res
            })
        })
}

const postNewUser = (req, res) => {
    const userObj = {
        ...req.body,
        file: req.file // Pasamos el archivo completo en lugar de solo el path
    }
    
    usersControllers.createNewUser(userObj)
        .then(data => {
            responses.success({
                status: 201,
                data,
                message: `User created successfully with id: ${data.id}`,
                res
            })
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: err.message || 'Error occurred trying to create a new user',
                res,
                fields: {
                    firstName: 'String (2-50 characters)',
                    lastName: 'String (2-50 characters)',
                    email: 'Valid email address',
                    password: 'String',
                    gender: 'String (optional)',
                    birthday: 'Date (optional)',
                    profileImage: 'File upload (optional)'
                }
            })
        })
}

const patchUser = (req, res) => {
    const id = req.params.id 
    const userObj = {
        ...req.body,
        file: req.file // Pasamos el archivo completo
    }

    usersControllers.updateUser(id, userObj)
        .then(data => {
            if(data){
                responses.success({
                    status: 200,
                    data, 
                    message: `User with id: ${id} modified successfully`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    message: `The user with ID ${id} not found`,
                    res,
                    fields: {
                        firstName: 'String (2-50 characters)',
                        lastName: 'String (2-50 characters)',
                        email: 'Valid email address',
                        password: 'String',
                        gender: 'String (optional)',
                        birthday: 'Date (optional)',
                        profileImage: 'File upload (optional)'
                    }
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: err.message || `Error occurred trying to update user with id ${id}`,
                res,
                fields: {
                    firstName: 'String (2-50 characters)',
                    lastName: 'String (2-50 characters)',
                    email: 'Valid email address',
                    password: 'String',
                    gender: 'String (optional)',
                    birthday: 'Date (optional)',
                    profileImage: 'File upload (optional)'
                }
            })
        })
}

const deleteUser = (req, res) => {
    const id = req.params.id 

    usersControllers.deleteUser(id)
        .then(data => {
            if(data){
                responses.success({
                    status: 200,
                    data, 
                    message: `User with id: ${id} deleted successfully`,
                    res
                })
            } else {
                responses.error({
                    status: 404,
                    data: err,
                    message: `The user with ID ${id} not found`,
                    res
                })
            }
        })
        .catch(err => {
            responses.error({
                status: 400,
                data: err,
                message: `Error occurred trying to delete user with id ${id}`,
                res
            })
        })
}

// Services for actions on my own user:

const getMyUser = (req, res) => {
    const id = req.user.id

    usersControllers.findUserById(id)
        .then(data => {
            responses.success({
                res,
                status: 200,
                message: 'This is your current user',
                data
            })
        })
        .catch(err => {
            responses.error({
                res,
                status: 400,
                message: 'Something bad getting the current user',
                data: err
            })
        })
}

const deleteMyUser = (req, res) => {
    const id = req.user.id

    usersControllers.deleteUser(id)
        .then(() => {
            responses.success({
                res,
                status: 200,
                message: `Your user account has been deleted successfully`
            })
        })
        .catch(err => {
            responses.error({
                res,
                status: 400,
                message: 'Something bad trying to delete your account',
                data: err
            })
        })
}

const patchMyUser = (req, res) => {
    const id = req.user.id
    const userObj = {
        ...req.body,
        file: req.file // Pasamos el archivo completo
    }

    // Hash password if provided
    if (userObj.password) {
        userObj.password = hashPassword(userObj.password)
    }

    usersControllers.updateUser(id, userObj)
        .then((data) => {
            if (data) {
                responses.success({
                    res,
                    status: 200,
                    message: 'Your profile has been updated successfully!',
                    data
                })
            } else {
                responses.error({
                    res,
                    status: 404,
                    message: 'User not found'
                })
            }
        })
        .catch(err => {
            responses.error({
                res,
                status: 400,
                message: err.message || 'Something bad happened while updating your profile',
                data: err
            })
        })
}

module.exports = {
    getAllUsers,
    getUserById,
    postNewUser,
    patchUser,
    deleteUser,
    getMyUser,
    deleteMyUser,
    patchMyUser
}