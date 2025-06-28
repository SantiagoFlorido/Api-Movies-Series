const router = require('express').Router()
const userServices = require('./users.services')
const passportJwt = require('../middlewares/auth.middleware')
const { uploadSingleImage } = require('../utils/multer') // Cambio importante aquí
const { validateUserData } = require('../middlewares/validations.middleware')

// Configuración de rutas públicas
router.get('/', userServices.getAllUsers)
router.post('/', 
  uploadSingleImage('profileImage'), // Usamos uploadSingleImage en lugar de upload.single
  validateUserData,
  userServices.postNewUser
)

// Rutas protegidas (requieren autenticación JWT)
router.get('/me', 
  passportJwt, 
  userServices.getMyUser
)

router.patch('/me',
  passportJwt,
  uploadSingleImage('profileImage'),
  validateUserData,
  userServices.patchMyUser
)

router.delete('/me',
  passportJwt,
  userServices.deleteMyUser
)

// Rutas de administración (protegidas y con posibles permisos adicionales)
router.get('/:id',
  passportJwt,
  userServices.getUserById
)

router.patch('/:id',
  passportJwt,
  uploadSingleImage('profileImage'),
  validateUserData,
  userServices.patchUser
)

router.delete('/:id',
  passportJwt,
  userServices.deleteUser
)

module.exports = router