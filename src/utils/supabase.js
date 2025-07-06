const { createClient } = require('@supabase/supabase-js');
const config = require('../../config').supabase;
const path = require('path');

// Validación de configuración mejorada
if (!config.url || !config.serviceRoleKey || !config.bucket) {
  throw new Error('Supabase configuration is missing. Please check your config file.');
}

// Inicializar cliente Supabase con opciones adicionales
const supabase = createClient(config.url, config.serviceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
});

// Verificar conexión con Supabase al iniciar
(async () => {
  try {
    const { data, error } = await supabase
      .storage
      .from(config.bucket)
      .list('', { limit: 1 });
    
    if (error) {
      console.error('Supabase connection test failed:', error.message);
      throw new Error('Failed to connect to Supabase Storage');
    }
    console.log('Successfully connected to Supabase Storage');
  } catch (err) {
    console.error('Supabase initialization error:', err);
    process.exit(1);
  }
})();

/**
 * Genera un nombre de archivo único con timestamp y random string
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${path.basename(originalName, ext)}_${timestamp}_${random}${ext}`;
};

/**
 * Sube un archivo a Supabase Storage
 * @param {Buffer|Object} file - Buffer del archivo u objeto de archivo Multer
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<string>} URL pública del archivo subido
 */
const uploadFile = async (file, options = {}) => {
  try {
    // Validación de entrada
    if (!file) {
      throw new Error('No file provided');
    }

    // Configuración de opciones
    const uploadOptions = {
      contentType: options.contentType || 'auto',
      cacheControl: options.cacheControl || '3600',
      upsert: true, // Habilitar sobrescritura de archivos existentes
      duplex: 'half', // Importante para streams grandes
      ...options
    };

    let fileBuffer;
    let fileName;
    let contentType = uploadOptions.contentType;

    // Manejar diferentes tipos de entrada
    if (file.buffer && Buffer.isBuffer(file.buffer)) {
      // Objeto de archivo Multer
      fileBuffer = file.buffer;
      fileName = options.filename || generateUniqueFilename(file.originalname || `file_${Date.now()}`);
      contentType = file.mimetype || contentType;
    } else if (Buffer.isBuffer(file)) {
      // Buffer directo
      fileBuffer = file;
      fileName = options.filename || generateUniqueFilename(`file_${Date.now()}`);
    } else if (typeof file === 'string') {
      // Ruta de archivo (legacy)
      const fs = require('fs');
      const { promisify } = require('util');
      const readFileAsync = promisify(fs.readFile);
      const unlinkAsync = promisify(fs.unlink);
      
      fileBuffer = await readFileAsync(file);
      fileName = options.filename || generateUniqueFilename(file.split('/').pop());
      
      try {
        await unlinkAsync(file);
      } catch (unlinkError) {
        console.warn('Could not delete temp file:', unlinkError);
      }
    } else {
      throw new TypeError('Invalid file type. Expected Buffer, Multer file object, or file path string');
    }

    // Validar tamaño del archivo (máximo 50MB)
    if (fileBuffer.length > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Determinar ruta de almacenamiento
    const filePath = options.folder 
      ? `${options.folder}/${fileName.replace(/[^a-zA-Z0-9\-._]/g, '')}`
      : fileName.replace(/[^a-zA-Z0-9\-._]/g, '');

    // Subir el archivo con reintentos
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const { data, error } = await supabase.storage
          .from(config.bucket)
          .upload(filePath, fileBuffer, {
            ...uploadOptions,
            contentType: contentType,
            upsert: true // Asegurarse de que se puede sobrescribir
          });

        if (error) {
          // Si el error es que el archivo ya existe, generamos un nuevo nombre y reintentamos
          if (error.message.includes('already exists')) {
            const newFileName = generateUniqueFilename(fileName);
            const newFilePath = options.folder 
              ? `${options.folder}/${newFileName.replace(/[^a-zA-Z0-9\-._]/g, '')}`
              : newFileName.replace(/[^a-zA-Z0-9\-._]/g, '');
            
            const { data: newData, error: newError } = await supabase.storage
              .from(config.bucket)
              .upload(newFilePath, fileBuffer, {
                ...uploadOptions,
                contentType: contentType
              });

            if (newError) throw newError;

            // Construir URL pública con caché-busting
            const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${newData.path}?${Date.now()}`;
            return publicUrl;
          }
          throw error;
        }

        // Construir URL pública con caché-busting
        const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${data.path}?${Date.now()}`;
        return publicUrl;
      } catch (err) {
        lastError = err;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError || new Error('Failed to upload file after multiple attempts');
  } catch (err) {
    console.error('Supabase upload error:', {
      message: err.message,
      stack: err.stack,
      ...(err.response && { response: err.response })
    });
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

/**
 * Elimina un archivo de Supabase Storage
 * @param {string} filePath - Ruta del archivo o URL completa
 * @returns {Promise<void>}
 */
const deleteFile = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    // Extraer solo la parte de la ruta después del bucket
    const pathOnly = filePath.includes(`${config.url}/storage/v1/object/public/${config.bucket}/`)
      ? filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '')
      : filePath;

    const { error } = await supabase.storage
      .from(config.bucket)
      .remove([pathOnly]);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Supabase delete error:', {
      message: err.message,
      filePath: filePath,
      stack: err.stack
    });
    throw new Error(`Failed to delete file: ${err.message}`);
  }
};

/**
 * Obtiene una URL firmada para acceso privado temporal
 * @param {string} filePath - Ruta del archivo o URL completa
 * @param {number} expiresIn - Segundos hasta que expira (default: 3600)
 * @returns {Promise<string>} URL firmada
 */
const getSignedUrl = async (filePath, expiresIn = 3600) => {
  try {
    if (!filePath) {
      throw new Error('No file path provided');
    }

    // Extraer solo la parte de la ruta después del bucket
    const pathOnly = filePath.includes(`${config.url}/storage/v1/object/public/${config.bucket}/`)
      ? filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '')
      : filePath;

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .createSignedUrl(pathOnly, expiresIn);

    if (error) throw error;

    return data.signedUrl;
  } catch (err) {
    console.error('Supabase signed URL error:', {
      message: err.message,
      filePath: filePath,
      stack: err.stack
    });
    throw new Error(`Failed to generate signed URL: ${err.message}`);
  }
};

/**
 * Verifica si un archivo existe en el bucket
 * @param {string} filePath - Ruta del archivo o URL completa
 * @returns {Promise<boolean>}
 */
const fileExists = async (filePath) => {
  try {
    const pathOnly = filePath.includes(`${config.url}/storage/v1/object/public/${config.bucket}/`)
      ? filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '')
      : filePath;

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .list('', {
        limit: 1,
        search: pathOnly
      });

    if (error) throw error;

    return data.length > 0 && data.some(file => file.name === pathOnly.split('/').pop());
  } catch (err) {
    console.error('Supabase file exists check error:', err);
    return false;
  }
};

/**
 * Obtiene metadatos de un archivo
 * @param {string} filePath - Ruta del archivo o URL completa
 * @returns {Promise<Object>} Metadatos del archivo
 */
const getFileMetadata = async (filePath) => {
  try {
    const pathOnly = filePath.includes(`${config.url}/storage/v1/object/public/${config.bucket}/`)
      ? filePath.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, '')
      : filePath;

    const { data, error } = await supabase.storage
      .from(config.bucket)
      .list('', {
        limit: 1,
        search: pathOnly
      });

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('File not found');

    return data[0];
  } catch (err) {
    console.error('Supabase get file metadata error:', err);
    throw new Error(`Failed to get file metadata: ${err.message}`);
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getSignedUrl,
  fileExists,
  getFileMetadata,
  supabaseClient: supabase
};