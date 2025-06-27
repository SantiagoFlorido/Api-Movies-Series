const { uploadImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const testCloudinaryConnection = async (file) => {
    if (!file) {
        throw new Error('No file provided for testing');
    }

    console.log('Testing Cloudinary with file:', file);

    try {
        // 1. Intenta subir la imagen a Cloudinary
        const uploadResult = await uploadImage(file.path);
        console.log('Cloudinary upload result:', uploadResult);

        // 2. Verifica que la URL de la imagen sea válida
        if (!uploadResult || !uploadResult.includes('res.cloudinary.com')) {
            throw new Error('Invalid Cloudinary URL received');
        }

        // 3. Elimina el archivo temporal
        fs.unlinkSync(file.path);

        return {
            cloudinaryUrl: uploadResult,
            fileInfo: {
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        // Limpieza en caso de error
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        throw error;
    }
};

module.exports = { testCloudinaryConnection };