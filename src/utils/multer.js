const multer = require('multer');
const path = require('path');

// Usamos memoryStorage para evitar escribir en disco
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage, // Almacena el archivo en memoria como Buffer
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF)!'));
  }
});

module.exports = upload;