const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Tipos de imagen permitidos (exportado para validaciones)
const allowedImageTypes = [
  'image/jpeg', 
  'image/png', 
  'image/gif', 
  'image/webp',
  'image/svg+xml'
];

// Configuración de almacenamiento en memoria (optimizado para Supabase)
const storage = multer.memoryStorage({
  // Opcional: Puedes configurar esto para manejar nombres de archivo
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de tipos de archivo mejorado
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  
  if (allowedImageTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} are allowed!`), false);
  }
};

// Configuración principal de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// Middleware para procesar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error específico de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 10MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false,
        error: 'Too many files. Only one file is allowed' 
      });
    }
  } else if (err) {
    // Otros errores
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  next();
};

// Middlewares específicos
const uploadSingleImage = (fieldName) => [
  upload.single(fieldName),
  (req, res, next) => {
    if (req.file) {
      // Asegurarse de que el archivo tenga las propiedades necesarias para Supabase
      req.file.buffer = req.file.buffer || Buffer.from(req.file.buffer);
      req.file.originalname = req.file.originalname || `file-${Date.now()}`;
    }
    next();
  }
];

const uploadMultipleImages = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        file.buffer = file.buffer || Buffer.from(file.buffer);
        file.originalname = file.originalname || `file-${Date.now()}`;
      });
    }
    next();
  }
];

const uploadMixedFiles = (fields) => [
  upload.fields(fields),
  (req, res, next) => {
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          file.buffer = file.buffer || Buffer.from(file.buffer);
          file.originalname = file.originalname || `file-${Date.now()}`;
        });
      });
    }
    next();
  }
];

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMixedFiles,
  fileFilter,
  handleMulterError,
  allowedImageTypes // Exportamos para usar en validaciones
};