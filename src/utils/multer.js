const multer = require('multer');
const path = require('path');

// Configuración avanzada de memoryStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB límite
    files: 1, // Solo permitir un archivo
    parts: 20 // Límite de partes del formulario
  },
  fileFilter: (req, file, cb) => {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    // Verificar tipo MIME
    const isValidMimeType = validMimeTypes.includes(file.mimetype);
    
    // Verificar extensión del archivo
    const extension = path.extname(file.originalname).toLowerCase();
    const isValidExtension = validExtensions.includes(extension);
    
    if (isValidMimeType && isValidExtension) {
      return cb(null, true);
    }
    
    // Error más descriptivo
    const error = new Error(
      `Tipo de archivo no válido. Solo se permiten: ${validExtensions.join(', ')}`
    );
    error.code = 'LIMIT_FILE_TYPE';
    cb(error);
  },
  onError: (err, next) => {
    // Manejo personalizado de errores
    if (err.code === 'LIMIT_FILE_SIZE') {
      err.message = 'El archivo excede el límite de 5MB';
    }
    next(err);
  }
});

// Middleware para manejar errores específicamente
upload.handleErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de Multer (LIMIT_FILE_SIZE, LIMIT_FILE_TYPE, etc.)
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code
    });
  } else if (err) {
    // Otros errores
    return res.status(400).json({
      success: false,
      message: err.message || 'Error al procesar el archivo'
    });
  }
  next();
};

module.exports = upload;