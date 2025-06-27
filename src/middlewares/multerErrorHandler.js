const multer = require('multer');

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores específicos de Multer
    let message = 'Error al subir el archivo';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'El archivo es demasiado grande (máximo 5MB)';
    } else if (err.code === 'LIMIT_FILE_TYPE') {
      message = 'Solo se permiten imágenes (JPEG, PNG, GIF)';
    }

    return res.status(400).json({
      success: false,
      message: message,
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  } else if (err) {
    // Otros errores
    return res.status(400).json({
      success: false,
      message: err.message || 'Error al procesar el archivo',
      error: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
  next();
};

module.exports = multerErrorHandler;