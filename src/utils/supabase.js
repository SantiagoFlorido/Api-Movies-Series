const { createClient } = require('@supabase/supabase-js');
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);
const config = require('../../config').supabase;

// Configuración robusta con validación
if (!config.url || !config.serviceRoleKey || !config.bucket) {
  throw new Error('Supabase configuration is missing. Please check your config file.');
}

// Inicializar cliente Supabase
const supabase = createClient(config.url, config.serviceRoleKey);

/**
 * Sube un archivo a Supabase Storage desde un buffer o path
 * @param {Buffer|string} file - Puede ser el buffer del archivo o la ruta temporal
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

    if (Buffer.isBuffer(file)) {
      fileBuffer = file;
      fileName = options.filename || `file_${Date.now()}`;
    } else {
      // Leer archivo desde ruta temporal
      fileBuffer = fs.readFileSync(file);
      fileName = options.filename || file.split('/').pop();
      
      // Eliminar el archivo temporal después de leerlo
      try {
        await unlinkAsync(file);
      } catch (unlinkError) {
        console.warn('Warning: Could not delete temp file:', unlinkError);
      }
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
    const { error } = await supabase.storage
      .from(config.bucket)
      .remove([filePath]);

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
    const { data, error } = await supabase.storage
      .from(config.bucket)
      .createSignedUrl(filePath, expiresIn);

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