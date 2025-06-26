const Users = require('../models/users.models');
const uuid = require('uuid');
const { hashPassword } = require('../utils/crypto');
const { uploadImage } = require('../utils/cloudinary');

const findAllUser = async () => {
    const data = await Users.findAll({
        attributes: {
            exclude: ['password'] // Exclude password from the response
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
            exclude: ['password'] // Exclude password from the response
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

const createNewUser = async (userObj) => {
    const newUser = {
        id: uuid.v4(),
        firstName: userObj.firstName,
        lastName: userObj.lastName,
        email: userObj.email,
        password: hashPassword(userObj.password),
        gender: userObj.gender || null,
        birthday: userObj.birthday || null,
        profileImage: userObj.profileImage || null,
        role: userObj.role || 'normal',
        status: userObj.status || 'active'
    };
    
    // If there's a file to upload (assuming userObj.file contains the file path)
    if (userObj.file) {
        try {
            const imageUrl = await uploadImage(userObj.file);
            newUser.profileImage = imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload profile image');
        }
    }
    
    const data = await Users.create(newUser);
    
    // Remove password from the returned user data
    const userWithoutPassword = data.toJSON();
    delete userWithoutPassword.password;
    
    return userWithoutPassword;
};

const updateUser = async (id, userObj) => {
    // Handle password update
    if (userObj.password) {
        userObj.password = hashPassword(userObj.password);
    }
    
    // Handle profile image upload
    if (userObj.file) {
        try {
            const imageUrl = await uploadImage(userObj.file);
            userObj.profileImage = imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
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
    const data = await Users.destroy({
        where: {
            id: id
        }
    });
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