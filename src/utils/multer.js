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

// Tipos de video permitidos
const allowedVideoTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo'
];

// Configuración de almacenamiento en memoria (optimizado para Supabase)
const storage = multer.memoryStorage({
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de tipos de archivo mejorado
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Determinar qué tipos permitir basado en el campo del formulario
  if (file.fieldname === 'coverUrl') {
    // Solo imágenes para la portada
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type. Only ${allowedExtensions.join(', ')} are allowed for cover!`), false);
    }
  } else if (file.fieldname === 'trailerUrl' || file.fieldname === 'movieUrl') {
    // Solo videos para tráiler y película
    const allowedExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid video type. Only ${allowedExtensions.join(', ')} are allowed for videos!`), false);
    }
  } else {
    cb(new Error('Unexpected file field'), false);
  }
};

// Configuración principal de Multer para subida de archivos individuales
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (aumentado para videos)
    files: 3 // Máximo 3 archivos (cover, trailer y movie)
  }
});

// Middleware para procesar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error específico de Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File too large. Maximum size is 50MB' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false,
        error: 'Too many files. Maximum 3 files allowed (cover, trailer, movie)' 
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        success: false,
        error: 'Unexpected file field. Only coverUrl, trailerUrl and movieUrl are allowed' 
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

// Middleware para subida de múltiples archivos (específico para películas)
const uploadMovieFiles = () => {
  return [
    upload.fields([
      { name: 'coverUrl', maxCount: 1 },
      { name: 'trailerUrl', maxCount: 1 },
      { name: 'movieUrl', maxCount: 1 }
    ]),
    (req, res, next) => {
      // Procesar los archivos subidos
      if (req.files) {
        // Asegurarse de que los buffers estén correctamente formados
        Object.keys(req.files).forEach(fieldName => {
          req.files[fieldName].forEach(file => {
            file.buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
            file.originalname = file.originalname || `${fieldName}-${Date.now()}${path.extname(file.originalname || '')}`;
          });
        });
        
        // Asignar a req.body para que el controlador pueda acceder
        if (req.files.coverUrl) req.body.coverUrl = req.files.coverUrl[0];
        if (req.files.trailerUrl) req.body.trailerUrl = req.files.trailerUrl[0];
        if (req.files.movieUrl) req.body.movieUrl = req.files.movieUrl[0];
      }
      next();
    },
    handleMulterError // Manejar errores de Multer
  ];
};

// Middlewares específicos (mantenidos por compatibilidad)
const uploadSingleImage = (fieldName) => [
  upload.single(fieldName),
  (req, res, next) => {
    if (req.file) {
      req.file.buffer = Buffer.isBuffer(req.file.buffer) ? req.file.buffer : Buffer.from(req.file.buffer);
      req.file.originalname = req.file.originalname || `file-${Date.now()}`;
      req.body[fieldName] = req.file;
    }
    next();
  },
  handleMulterError
];

const uploadMultipleImages = (fieldName, maxCount = 5) => [
  upload.array(fieldName, maxCount),
  (req, res, next) => {
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        file.buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
        file.originalname = file.originalname || `file-${Date.now()}`;
      });
      req.body[fieldName] = req.files;
    }
    next();
  },
  handleMulterError
];

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  uploadMovieFiles, // Nuevo middleware específico para películas
  fileFilter,
  handleMulterError,
  allowedImageTypes,
  allowedVideoTypes
};