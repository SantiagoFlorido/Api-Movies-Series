const Users = require('../models/users.models');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/crypto');
const { uploadImage, deleteImage } = require('../utils/cloudinary'); // Añadido deleteImage

const findAllUser = async (limit = 10, offset = 0) => {
    const data = await Users.findAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
        },
        order: [['createdAt', 'DESC']]
    });
    return data;
};

const findUserById = async (id) => {
    const data = await Users.findOne({
        where: {
            id: id
        },
        attributes: {
            exclude: ['password', 'createdAt', 'updatedAt']
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
    const transaction = await Users.sequelize.transaction();
    
    try {
        const newUser = {
            id: uuid.v4(),
            firstName: userObj.firstName.trim(),
            lastName: userObj.lastName.trim(),
            email: userObj.email.toLowerCase().trim(),
            password: hashPassword(userObj.password),
            gender: userObj.gender || null,
            birthday: userObj.birthday || null,
            profileImage: null,
            role: userObj.role || 'normal',
            status: userObj.status || 'active'
        };
        
        // Handle file upload
        if (file) {
            try {
                const imageUrl = await uploadImage(file.path);
                newUser.profileImage = imageUrl;
                
                // Delete temp file
                fs.unlinkSync(file.path);
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                throw new Error('Error al subir la imagen de perfil');
            }
        }
        
        const createdUser = await Users.create(newUser, { transaction });
        const userResponse = createdUser.toJSON();
        delete userResponse.password;
        
        await transaction.commit();
        return userResponse;
        
    } catch (error) {
        await transaction.rollback();
        console.error('User creation error:', error);
        
        // Cleanup if user creation fails but image was uploaded
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        
        throw new Error(error.message || 'Error al crear el usuario');
    }
};

const updateUser = async (id, userObj, file) => {
    const transaction = await Users.sequelize.transaction();
    
    try {
        const currentUser = await findUserById(id);
        if (!currentUser) {
            throw new Error('Usuario no encontrado');
        }
        
        const updateData = {
            firstName: userObj.firstName ? userObj.firstName.trim() : currentUser.firstName,
            lastName: userObj.lastName ? userObj.lastName.trim() : currentUser.lastName,
            email: userObj.email ? userObj.email.toLowerCase().trim() : currentUser.email,
            gender: userObj.gender || currentUser.gender || null,
            birthday: userObj.birthday || currentUser.birthday || null,
            role: userObj.role || currentUser.role,
            status: userObj.status || currentUser.status
        };
        
        if (userObj.password) {
            updateData.password = hashPassword(userObj.password);
        }
        
        // Handle profile image update
        if (file) {
            try {
                // Upload new image
                const imageUrl = await uploadImage(file.path);
                updateData.profileImage = imageUrl;
                
                // Delete temp file
                fs.unlinkSync(file.path);
                
                // Delete old image from Cloudinary if exists
                if (currentUser.profileImage) {
                    await deleteImage(currentUser.profileImage);
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                if (file.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                throw new Error('Error al actualizar la imagen de perfil');
            }
        }
        
        const [affectedRows] = await Users.update(updateData, {
            where: { id: id },
            transaction
        });
        
        if (affectedRows === 0) {
            throw new Error('No se pudo actualizar el usuario');
        }
        
        const updatedUser = await findUserById(id);
        await transaction.commit();
        return updatedUser;
        
    } catch (error) {
        await transaction.rollback();
        console.error('Update user error:', error);
        throw error;
    }
};

const deleteUser = async (id) => {
    const transaction = await Users.sequelize.transaction();
    
    try {
        const userToDelete = await findUserById(id);
        if (!userToDelete) {
            throw new Error('Usuario no encontrado');
        }
        
        // Delete profile image from Cloudinary if exists
        if (userToDelete.profileImage) {
            try {
                await deleteImage(userToDelete.profileImage);
            } catch (deleteError) {
                console.error('Error deleting image from Cloudinary:', deleteError);
                // Continue with user deletion even if image deletion fails
            }
        }
        
        const deletedCount = await Users.destroy({
            where: { id: id },
            transaction
        });
        
        if (deletedCount === 0) {
            throw new Error('No se pudo eliminar el usuario');
        }
        
        await transaction.commit();
        return { message: 'Usuario eliminado correctamente' };
        
    } catch (error) {
        await transaction.rollback();
        console.error('Delete user error:', error);
        throw error;
    }
};

module.exports = {
    findAllUser,
    findUserById,
    findUserByEmail,
    createNewUser,
    updateUser,
    deleteUser
};