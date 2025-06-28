const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configuración de almacenamiento en memoria (optimizado para Supabase)
const storage = multer.memoryStorage();

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/svg+xml'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed!`), false);
  }
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
    files: 1 // Solo permite un archivo por campo
  },
  // Manejo de errores personalizado
  onError: function(err, next) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new Error('File too large. Maximum size is 10MB'));
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      next(new Error('Too many files. Only one file is allowed'));
    } else {
      next(err);
    }
  }
});

// Middlewares específicos para diferentes casos de uso
const uploadSingleImage = (fieldName) => upload.single(fieldName);
const uploadMultipleImages = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadMixedFiles = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  fileFilter
};