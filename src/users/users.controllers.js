const Users = require('../models/users.models');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/crypto');
const { uploadImage } = require('../utils/cloudinary');

const findAllUser = async () => {
    const data = await Users.findAll({
        attributes: {
            exclude: ['password']
        }
    });
    return data;
};

const findUserById = async (id) => {
    const data = await Users.findOne({
        where: {
            id: id
        },
        attributes: {
            exclude: ['password']
        }
    });
    return data;
};

const findUserByEmail = async (email) => {
    const data = await Users.findOne({
        where: {
            email: email
        }
    });
    return data;
};

const createNewUser = async (userObj, file) => {
    const newUser = {
        id: uuid.v4(),
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        password: hashPassword(userObj.password),
        gender: userObj.gender || null,
        birthday: userObj.birthday || null,
        profileImage: null, // Inicialmente null
        role: userObj.role || 'normal',
        status: userObj.status || 'active'
    };
    
    // Si hay archivo, lo subimos a Cloudinary
    if (file) {
        try {
            // Subir imagen a Cloudinary
            const imageUrl = await uploadImage(file.path);
            newUser.profileImage = imageUrl;
            
            // Eliminar el archivo temporal después de subirlo
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            // Si falla la subida, eliminamos el archivo temporal si existe
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new Error('Failed to upload profile image');
        }
    }
    
    try {
        const data = await Users.create(newUser);
        const userWithoutPassword = data.toJSON();
        delete userWithoutPassword.password;
        return userWithoutPassword;
    } catch (error) {
        // Si hay error al crear el usuario, eliminamos la imagen de Cloudinary si se subió
        if (newUser.profileImage) {
            // Aquí podrías implementar lógica para eliminar de Cloudinary
            console.warn('User creation failed, but image was uploaded to Cloudinary:', newUser.profileImage);
        }
        throw error;
    }
};

const updateUser = async (id, userObj, file) => {
    // Handle password update
    if (userObj.password) {
        userObj.password = hashPassword(userObj.password);
    }
    
    // Handle profile image upload
    if (file) {
        try {
            // Subir nueva imagen a Cloudinary
            const imageUrl = await uploadImage(file.path);
            userObj.profileImage = imageUrl;
            
            // Eliminar el archivo temporal después de subirlo
            fs.unlink(file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
            
            // Obtener usuario actual para eliminar la imagen anterior de Cloudinary
            const currentUser = await findUserById(id);
            if (currentUser && currentUser.profileImage) {
                // Aquí podrías implementar lógica para eliminar la imagen anterior de Cloudinary
                console.log('Old profile image that should be deleted:', currentUser.profileImage);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            // Si falla la subida, eliminamos el archivo temporal si existe
            if (file.path && fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw new Error('Failed to upload profile image');
        }
    }
    
    const [affectedRows] = await Users.update(userObj, {
        where: {
            id: id
        }
    });
    
    if (affectedRows > 0) {
        const updatedUser = await findUserById(id);
        return updatedUser;
    }
    
    return null;
};

const deleteUser = async (id) => {
    // Opcional: Obtener usuario antes de borrar para eliminar su imagen de Cloudinary
    const userToDelete = await findUserById(id);
    
    const data = await Users.destroy({
        where: {
            id: id
        }
    });
    
    if (data > 0 && userToDelete && userToDelete.profileImage) {
        // Aquí podrías implementar lógica para eliminar la imagen de Cloudinary
        console.log('User deleted, profile image that should be deleted:', userToDelete.profileImage);
    }
    
    return data;
};

module.exports = {
    findAllUser,
    findUserById,
    findUserByEmail,
    createNewUser,
    updateUser,
    deleteUser
};