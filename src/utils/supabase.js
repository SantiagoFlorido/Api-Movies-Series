const { createClient } = require('@supabase/supabase-js');
const config = require('../../config').supabase;

// Configuración robusta con validación
if (!config.url || !config.serviceRoleKey || !config.bucket) {
  throw new Error('Supabase configuration is missing. Please check your config file.');
}

// Inicializar cliente Supabase
const supabase = createClient(config.url, config.serviceRoleKey);

/**
 * Sube un archivo a Supabase Storage desde un buffer o objeto de archivo Multer
 * @param {Buffer|Object} file - Puede ser el buffer del archivo o el objeto file de Multer
 * @param {Object} [options={}] - Opciones adicionales para la subida
 * @returns {Promise<string>} URL pública del archivo subido
 */
const uploadFile = async (file, options = {}) => {
  try {
    const uploadOptions = {
      contentType: options.contentType || 'auto',
      cacheControl: options.cacheControl || '3600',
      upsert: options.upsert || false,
      ...options
    };

    let fileBuffer;
    let fileName;

    // Si es un objeto de archivo de Multer
    if (file && file.buffer) {
      fileBuffer = file.buffer;
      fileName = options.filename || file.originalname || `file_${Date.now()}`;
      
      // Si no se proporcionó contentType, intenta obtenerlo del archivo
      if (!uploadOptions.contentType || uploadOptions.contentType === 'auto') {
        uploadOptions.contentType = file.mimetype || 'application/octet-stream';
      }
    } 
    // Si es un Buffer directamente
    else if (Buffer.isBuffer(file)) {
      fileBuffer = file;
      fileName = options.filename || `file_${Date.now()}`;
    } 
    // Si es una ruta de archivo (mantenido por compatibilidad)
    else if (typeof file === 'string') {
      const fs = require('fs');
      const { promisify } = require('util');
      const unlinkAsync = promisify(fs.unlink);
      
      fileBuffer = fs.readFileSync(file);
      fileName = options.filename || file.split('/').pop();
      
      // Eliminar el archivo temporal después de leerlo
      try {
        await unlinkAsync(file);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temp file:', unlinkError);
      }
    } 
    // Tipo no soportado
    else {
      throw new TypeError('The "file" argument must be a Buffer, Multer file object, or file path string');
    }

    // Definir ruta en el bucket
    const filePath = options.folder 
      ? `${options.folder}/${fileName}`
      : fileName;

    // Subir el archivo a Supabase
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .upload(filePath, fileBuffer, uploadOptions);

    if (error) {
      throw error;
    }

    // Construir URL pública
    const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${data.path}`;
    
    return publicUrl;
  } catch (err) {
    console.error('Supabase upload error:', {
      message: err.message,
      stack: err.stack,
      ...(err.response && { response: err.response })
    });
    throw new Error('Failed to upload file to Supabase');
  }
};

/**
 * Elimina un archivo de Supabase Storage
 * @param {string} filePath - Ruta del archivo en el bucket (ej: 'folder/filename.jpg')
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    // Extraer solo la parte de la ruta después del bucket si es una URL completa
    const pathOnly = filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '');
    
    const { error } = await supabase.storage
      .from(config.bucket)
      .remove([pathOnly]);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Supabase delete error:', err);
    throw new Error('Failed to delete file from Supabase');
  }
};

/**
 * Obtiene una URL firmada para acceso privado temporal
 * @param {string} filePath - Ruta del archivo en el bucket
 * @param {number} expiresIn - Segundos hasta que expira el enlace (default: 3600)
 * @returns {Promise<string>} URL firmada
 */
const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    // Extraer solo la parte de la ruta después del bucket si es una URL completa
    const pathOnly = filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '');
    
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .createSignedUrl(pathOnly, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Supabase signed URL error:', err);
    throw new Error('Failed to generate signed URL');
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  supabaseClient: supabase // Exportamos el cliente por si necesitas acceder directamente
};