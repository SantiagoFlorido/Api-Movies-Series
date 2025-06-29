const Users = require('../models/users.models');
const uuid = require('uuid');
const { hashPassword } = require('../utils/crypto');
const { uploadFile, deleteFile } = require('../utils/supabase');

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
    
    // Manejo de la imagen de perfil con Supabase
    if (userObj.file) {
        try {
            // Asegurarnos de que el buffer esté correctamente formado
            const fileBuffer = Buffer.isBuffer(userObj.file.buffer) 
                ? userObj.file.buffer 
                : Buffer.from(userObj.file.buffer);
            
            const imageUrl = await uploadFile({
                ...userObj.file,
                buffer: fileBuffer
            }, {
                folder: 'profile_images',
                filename: `user_${newUser.id}_${Date.now()}`,
                contentType: userObj.file.mimetype || 'image/jpeg'
            });
            newUser.profileImage = imageUrl;
        } catch (error) {
            console.error('Error uploading image to Supabase:', error);
            throw new Error('Failed to upload profile image');
        }
    }
    
    const data = await Users.create(newUser);
    
    const userWithoutPassword = data.toJSON();
    delete userWithoutPassword.password;
    
    return userWithoutPassword;
};

const updateUser = async (id, userObj) => {
    // Manejo de actualización de contraseña
    if (userObj.password) {
        userObj.password = hashPassword(userObj.password);
    }
    
    // Obtener usuario actual para manejar la imagen anterior
    const currentUser = await findUserById(id);
    
    // Manejo de la imagen de perfil con Supabase
    if (userObj.file) {
        try {
            // Eliminar la imagen anterior si existe
            if (currentUser && currentUser.profileImage) {
                const oldImagePath = extractPathFromUrl(currentUser.profileImage);
                await deleteFile(oldImagePath).catch(err => 
                    console.error('Error deleting old image:', err)
                );
            }
            
            // Asegurarnos de que el buffer esté correctamente formado
            const fileBuffer = Buffer.isBuffer(userObj.file.buffer) 
                ? userObj.file.buffer 
                : Buffer.from(userObj.file.buffer);
            
            // Subir nueva imagen
            const imageUrl = await uploadFile({
                ...userObj.file,
                buffer: fileBuffer
            }, {
                folder: 'profile_images',
                filename: `user_${id}_${Date.now()}`,
                contentType: userObj.file.mimetype || 'image/jpeg'
            });
            userObj.profileImage = imageUrl;
        } catch (error) {
            console.error('Error updating profile image in Supabase:', error);
            throw new Error('Failed to update profile image');
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
    // Obtener usuario para eliminar su imagen de perfil
    const user = await findUserById(id);
    
    // Eliminar imagen de perfil de Supabase si existe
    if (user && user.profileImage) {
        try {
            const imagePath = extractPathFromUrl(user.profileImage);
            await deleteFile(imagePath);
        } catch (error) {
            console.error('Error deleting profile image from Supabase:', error);
            // No detenemos la eliminación del usuario por este error
        }
    }
    
    // Eliminar usuario de la base de datos
    const data = await Users.destroy({
        where: {
            id: id
        }
    });
    return data;
};

// Función auxiliar para extraer la ruta del archivo desde la URL de Supabase
function extractPathFromUrl(url) {
    if (!url) return null;
    
    // Extraer la parte después de 'object/public/'
    const publicIndex = url.indexOf('object/public/');
    if (publicIndex !== -1) {
        return url.substring(publicIndex + 'object/public/'.length);
    }
    
    // Si no coincide, devolver la URL completa (por compatibilidad)
    return url;
}

module.exports = {
    findAllUser,
    findUserById,
    findUserByEmail,
    createNewUser,
    updateUser,
    deleteUser
};