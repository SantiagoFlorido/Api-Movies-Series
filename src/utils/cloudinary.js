const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);

// Configuración robusta con validación
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true // Fuerza HTTPS
});

/**
 * Sube una imagen a Cloudinary desde un buffer o path
 * @param {Buffer|string} file - Puede ser el buffer del archivo o la ruta temporal
 * @param {Object} [options={}] - Opciones adicionales para Cloudinary
 * @returns {Promise<string>} URL segura de la imagen subida
 */
const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      folder: 'ApiMovies',
      resource_type: 'auto', // Detecta automáticamente si es imagen/video
      ...options
    };

    let result;
    
    if (Buffer.isBuffer(file)) {
      // Subida desde buffer (sin archivo temporal)
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Subida desde ruta de archivo
      result = await cloudinary.uploader.upload(file, uploadOptions);
      
      // Elimina el archivo temporal después de subir
      try {
        await unlinkAsync(file);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temp file:', unlinkError);
      }
    }

    if (!result?.secure_url) {
      throw new Error('Cloudinary upload failed: No URL returned');
    }

    return result.secure_url;
  } catch (err) {
    console.error('Cloudinary upload error:', {
      message: err.message,
      stack: err.stack,
      ...(err.response && { response: err.response })
    });
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen en Cloudinary
 * @returns {Promise<void>}
 */
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  cloudinary // Exportamos el cliente por si necesitas acceder directamente
};