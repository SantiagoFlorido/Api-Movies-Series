const Users = require('../models/users.models');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../utils/crypto');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

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
        // Validate required fields
        if (!userObj.firstName || !userObj.lastName || !userObj.email || !userObj.password) {
            throw new Error('Missing required fields');
        }

        const newUser = {
            id: uuid.v4(),
            firstName: userObj.firstName.toString().trim(),
            lastName: userObj.lastName.toString().trim(),
            email: userObj.email.toString().toLowerCase().trim(),
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
                // Use file buffer directly instead of file path to avoid ENAMETOOLONG
                const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const imageUrl = await uploadImage(fileStr);
                newUser.profileImage = imageUrl;
                
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                throw new Error('Error uploading profile image');
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
        throw error;
    }
};

const updateUser = async (id, userObj, file) => {
    const transaction = await Users.sequelize.transaction();
    
    try {
        const currentUser = await findUserById(id);
        if (!currentUser) {
            throw new Error('User not found');
        }
        
        const updateData = {
            firstName: userObj.firstName ? userObj.firstName.toString().trim() : currentUser.firstName,
            lastName: userObj.lastName ? userObj.lastName.toString().trim() : currentUser.lastName,
            email: userObj.email ? userObj.email.toString().toLowerCase().trim() : currentUser.email,
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
                // Upload new image using buffer directly
                const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const imageUrl = await uploadImage(fileStr);
                updateData.profileImage = imageUrl;
                
                // Delete old image from Cloudinary if exists
                if (currentUser.profileImage) {
                    await deleteImage(currentUser.profileImage);
                }
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                throw new Error('Error updating profile image');
            }
        }
        
        const [affectedRows] = await Users.update(updateData, {
            where: { id: id },
            transaction
        });
        
        if (affectedRows === 0) {
            throw new Error('Failed to update user');
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
            throw new Error('User not found');
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
            throw new Error('Failed to delete user');
        }
        
        await transaction.commit();
        return { message: 'User deleted successfully' };
        
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